using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;
using System.Xml.Linq;
using prepWise.Controllers; //משתנה לפי שם הפרויקט
using prepWise.BL;//משתנה לפי שם הפרויקט
using System.Diagnostics.Eventing.Reader;
using static Azure.Core.HttpHeader;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging.Abstractions;
using System.Reflection.PortableExecutable;
using static Azure.Core.HttpHeader;
using Microsoft.Extensions.FileSystemGlobbing;
using Azure.Core;



namespace prepWise.DAL
{
    public class UsersDB
    {
        public UsersDB()
        {
            //
            // TODO: Add constructor logic here
            //
        }

        //--------------------------------------------------------------------------------------------------
        // This method creates a connection to the database according to the connectionString name in the web.config 
        //--------------------------------------------------------------------------------------------------
        public SqlConnection connect(String conString)
        {

            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }
        //---------------------------------------------------------------------------------
        // Create the SqlCommand
        //---------------------------------------------------------------------------------
        private SqlCommand CreateCommandWithStoredProcedureGeneral(String spName, SqlConnection con, Dictionary<string, object> paramDic)
        {

            SqlCommand cmd = new SqlCommand(); // create the command object

            cmd.Connection = con;              // assign the connection to the command object

            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 

            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds

            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text

            if (paramDic != null)
                foreach (KeyValuePair<string, object> param in paramDic)
                {
                    cmd.Parameters.AddWithValue(param.Key, param.Value);

                }


            return cmd;
        }

  

        public int InsertUser(User newUser, UserFile? file = null)
        {
            SqlConnection con;
            SqlCommand cmd;


            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw new Exception("Database connection failed", ex);
            }
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@FirstName", newUser.FirstName);       // Corresponds to FirstName in the table
            paramDic.Add("@LastName", newUser.LastName);         // Corresponds to LastName in the table
            paramDic.Add("@Email", newUser.Email);               // Corresponds to Email in the table
            paramDic.Add("@Password", newUser.Password);         // Corresponds to Password in the table
            paramDic.Add("@Picture", newUser.Picture);           // Corresponds to Picture in the table
            paramDic.Add("@CareerField", string.Join(",", newUser.CareerField));   // Corresponds to CareerField in the table
            paramDic.Add("@Roles", string.Join(",", newUser.Roles));   // Corresponds to CareerField in the table
            paramDic.Add("@Company", string.Join(",", newUser.Company));   // Corresponds to CareerField in the table
            paramDic.Add("@Experience", newUser.Experience);     // Corresponds to Experience in the table
            paramDic.Add("@Language", string.Join(",", newUser.Language));         // Corresponds to Language in the table
            paramDic.Add("@FacebookLink", newUser.FacebookLink ?? (object)DBNull.Value); // Corresponds to FacebookLink in the table
            paramDic.Add("@LinkedInLink", newUser.LinkedInLink ?? (object)DBNull.Value); // Corresponds to LinkedInLink in the table
            paramDic.Add("@IsMentor", newUser.IsMentor); // Corresponds to LinkedInLink in the table
                                                         // 🔍 Check if newUser is of type Mentor
            if (newUser is Mentor mentor)
            {
                paramDic.Add("@MentoringType", mentor.MentoringType ?? (object)DBNull.Value);
                paramDic.Add("@IsHr", mentor.IsHr);
                paramDic.Add("@Gender", mentor.Gender);
            }
            else
            {
                paramDic.Add("@MentoringType", DBNull.Value);
                paramDic.Add("@IsHr", DBNull.Value);
                paramDic.Add("Gender", DBNull.Value);
            }



            cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertNewUser", con, paramDic);        // create the command
            cmd.CommandTimeout = 500;  // temporary , connection is having issues
            //int rowsAffected;
            int userId;

            try
            {
                //rowsAffected = cmd.ExecuteNonQuery(); // עדיין לא מחזיר UserID
                object result = cmd.ExecuteScalar();
                userId = (result != null) ? Convert.ToInt32(result) : -1;
            }
            catch (Exception ex)
            {
                con?.Close();
                Console.WriteLine("❌ SQL Insert Failed");
                foreach (var param in paramDic)
                {
                    Console.WriteLine($"Param {param.Key} = {param.Value}");
                }
                throw new Exception("Failed to insert user", ex);
            }
            con.Close();

            // אם נוצר משתמש ויש קובץ לצרף (רק אם הוא Job Seeker)
            if (userId > 0 && !newUser.IsMentor && file != null)
            {
                file.UserID = userId;
                AddUserFile(file);
            }

            return userId;
        }


        public int AddUserFile(UserFile file, int? applicationId = null)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                using (SqlCommand cmd = new SqlCommand("SP_InsertUserFile", con))
                {
                    cmd.CommandType = CommandType.StoredProcedure;
                    cmd.Parameters.AddWithValue("@UserID", file.UserID);
                    cmd.Parameters.AddWithValue("@FileName", file.FileName);
                    cmd.Parameters.AddWithValue("@FilePath", file.FilePath);
                    cmd.Parameters.AddWithValue("@IsDefault", file.IsDefault);
                    cmd.Parameters.AddWithValue("@FileType", file.FileType);
                    cmd.Parameters.AddWithValue("@UploadedAt", file.UploadedAt);

                    // כאן מתבצעת ההעברה
                    //cmd.Parameters.AddWithValue("@ApplicationID", (object?)applicationId ?? DBNull.Value);
                    cmd.Parameters.AddWithValue("@ApplicationID", (object?)applicationId ?? DBNull.Value);


                    return Convert.ToInt32(cmd.ExecuteScalar());
                }
            }
        }

        public bool LinkFileToApplication(int applicationId, int fileId)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                SqlCommand cmd = new SqlCommand("SP_LinkFileToApplication", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@ApplicationID", applicationId);
                cmd.Parameters.AddWithValue("@FileID", fileId);

                SqlParameter wasInserted = new SqlParameter("@WasInserted", SqlDbType.Bit)
                {
                    Direction = ParameterDirection.Output
                };
                cmd.Parameters.Add(wasInserted);

                cmd.ExecuteNonQuery();

                return (bool)wasInserted.Value;
            }
        }


 

    
        public List<dynamic> GetUserFiles(int userId, int? applicationId = null)
        {
            List<dynamic> files = new List<dynamic>();

            using (SqlConnection con = connect("myProjDB"))
            {
                Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@UserID", userId },
            { "@ApplicationID", applicationId.HasValue ? applicationId.Value : (object)DBNull.Value }
        };

                SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("GetUserFiles", con, paramDic);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        files.Add(new
                        {
                            FileID = reader.GetInt32(reader.GetOrdinal("FileID")),
                            FileName = reader.GetString(reader.GetOrdinal("FileName")),
                            UploadedAt = reader.GetDateTime(reader.GetOrdinal("UploadedAt")),
                            IsDefault = reader.GetBoolean(reader.GetOrdinal("IsDefault")),
                            FilePath = reader.GetString(reader.GetOrdinal("FilePath"))
                        });
                    }
                }
            }

            return files;
        }

        public UserFile GetFileById(int fileId)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                string query = "SELECT FileID, FileName, FilePath, UserID FROM UserFiles WHERE FileID = @FileID";

                using (SqlCommand cmd = new SqlCommand(query, con))
                {
                    cmd.Parameters.AddWithValue("@FileID", fileId);

                    using (SqlDataReader reader = cmd.ExecuteReader())
                    {
                        if (reader.Read())
                        {
                            return new UserFile
                            {
                                FileID = reader.GetInt32(reader.GetOrdinal("FileID")),
                                FileName = reader.GetString(reader.GetOrdinal("FileName")),
                                FilePath = reader.GetString(reader.GetOrdinal("FilePath")),
                                UserID = reader.GetInt32(reader.GetOrdinal("UserID"))
                            };
                        }
                    }
                }
            }

            return null;
        }


        public bool DeleteUserFile(int userId, int fileId)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@UserID", userId },
            { "@FileID", fileId }
        };

                SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteUserFile", con, paramDic);

                try
                {
                    int affectedRows = cmd.ExecuteNonQuery();
                    return affectedRows > 0;
                }
                catch (Exception ex)
                {
                    Console.WriteLine("❌ Error deleting user file: " + ex.Message);
                    throw;
                }
            }
        }

        public bool UnlinkFileFromApplication(int applicationId, int fileId)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            { "@ApplicationID", applicationId },
            { "@FileID", fileId }
        };

                SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_UnlinkFileFromApplication", con, paramDic);

                try
                {
                    int affectedRows = cmd.ExecuteNonQuery();
                    return affectedRows > 0;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(" Error unlinking file from application: " + ex.Message);
                    throw;
                }
            }
        }



        //Edit Profile Page - personal details can be edited and updated 
 

//Edit Profile Page - personal details can be edited and updated 
public int UpdateUserProfile(int id, User Updateuser)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {

                throw (ex);
            }
            int sumOfNumEff = 0;


            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserID", id);
            paramDic.Add("@FirstName", Updateuser.FirstName);
            paramDic.Add("@LastName", Updateuser.LastName);
            paramDic.Add("@Email", Updateuser.Email);
            paramDic.Add("@Password", Updateuser.Password);
            paramDic.Add("@CareerField", Updateuser.CareerField != null ? string.Join(",", Updateuser.CareerField) : null); // המרה למחרוזת
            paramDic.Add("@Roles", Updateuser.Roles != null ? string.Join(",", Updateuser.Roles) : null); // המרה למחרוזת
            paramDic.Add("@Company", Updateuser.Company != null ? string.Join(",", Updateuser.Company) : null); // המרה למחרוזת
            paramDic.Add("@Experience", Updateuser.Experience);
            paramDic.Add("@Language", Updateuser.Language != null ? string.Join(",", Updateuser.Language) : null); // המרה למחרוזת
            paramDic.Add("@FacebookLink", Updateuser.FacebookLink);
            paramDic.Add("@LinkedInLink", Updateuser.LinkedInLink);
            paramDic.Add("@Picture", Updateuser.Picture);
            paramDic.Add("@IsMentor", Updateuser.IsMentor); // Corresponds to LinkedInLink in the table

            // 🔍 Check if newUser is of type Mentor
            if (Updateuser is Mentor mentor)
            {
                paramDic.Add("@MentoringType", mentor.MentoringType ?? (object)DBNull.Value);
                paramDic.Add("@Gender", mentor.Gender);
                paramDic.Add("@IsHr", mentor.IsHr);
            }
            else
            {
                paramDic.Add("@MentoringType", DBNull.Value);
                paramDic.Add("@Gender", DBNull.Value);
                paramDic.Add("@IsHr", DBNull.Value);

            }

            cmd = CreateCommandWithStoredProcedureGeneral("sp_UpdateUserProfile", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery();
                sumOfNumEff += numEffected;
            }
            catch (Exception ex)
            {
                if (con != null)
                {
                    con.Close();
                }
                throw (ex);
            }

            if (con != null)
            {
                con.Close();
            }
            return sumOfNumEff;
        }


        /// this will find a user by email and password
        /// 
        public User findUser(string usermail, string userpassword)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            // List&lt;User&gt; users = new List&lt;User&gt;();
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@Email", usermail);
            paramDic.Add("@Password", userpassword);


            cmd = CreateCommandWithStoredProcedureGeneral("SP_FindUserByEmailPassword", con, paramDic);
            cmd.CommandTimeout = 600;  // temporary , connection is having issues

            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                if (dataReader.Read()) // Check if a row is returned
                {
                    User u = new User
                    {
                        UserID = Convert.ToInt32(dataReader["UserID"]),
                        FirstName = dataReader["FirstName"].ToString(),
                        LastName = dataReader["LastName"].ToString(),
                        Email = dataReader["Email"].ToString(),
                        Password = dataReader["Password"].ToString(),
                        Picture = dataReader["Picture"].ToString(),
                        Experience = dataReader["Experience"].ToString(),
                        FacebookLink = dataReader["FacebookLink"].ToString(),
                        LinkedInLink = dataReader["LinkedInLink"].ToString(),
                        IsMentor = Convert.ToBoolean(dataReader["IsMentor"])
                    };
                    return u;
                }

                return null; // Return null if no user is found
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }

        // Edit Profile Page - It will be possible to see the same personal details with which the user registered.
        public User ReadUser(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }


            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserID", userId);

            cmd = CreateCommandWithStoredProcedureGeneral("sp_ReadUserDetails", con, paramDic);
            cmd.CommandTimeout = 500;  // temporary , connection is having issues

            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                if (dataReader.Read())
                {
                    bool isMentor = Convert.ToBoolean(dataReader["IsMentor"]);
                    User userDetails = isMentor ? new Mentor() : new User();
                    userDetails.UserID = Convert.ToInt32(dataReader["UserID"]);
                    userDetails.FirstName = dataReader["FirstName"].ToString();
                    userDetails.LastName = dataReader["LastName"].ToString();
                    userDetails.Email = dataReader["Email"].ToString();
                    userDetails.Password = dataReader["Password"].ToString();
                    userDetails.Picture = dataReader["Picture"].ToString();
                    userDetails.CareerField = dataReader["CareerFieldNames"].ToString()
                               .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries)
                               .ToList();
                    userDetails.Roles = dataReader["RolesNames"].ToString()
                              .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries)
                              .ToList();
                    userDetails.Company = dataReader["CompaniesNames"].ToString()
                              .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries)
                              .ToList();
                    userDetails.Experience = dataReader["Experience"].ToString();
                    userDetails.Language = dataReader["LanguageNames"].ToString()
                               .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries)
                               .ToList();
                    userDetails.FacebookLink = dataReader["FacebookLink"].ToString();
                    userDetails.LinkedInLink = dataReader["LinkedInLink"].ToString();
                    userDetails.IsMentor = Convert.ToBoolean(dataReader["IsMentor"]);
                    // 🔍 If this user is a mentor, cast to Mentor and assign extra fields
                    if (userDetails.IsMentor && userDetails is Mentor mentorDetails)
                    {
                        mentorDetails.MentoringType = dataReader["MentoringType"] != DBNull.Value ? dataReader["MentoringType"].ToString() : null;
                        mentorDetails.IsHr = dataReader["IsHr"] != DBNull.Value
                                ? Convert.ToBoolean(dataReader["IsHr"])
                                : false; // or null if IsHr is nullable
                        mentorDetails.Gender = dataReader["Gender"] != DBNull.Value ? dataReader["Gender"].ToString() : null;
                    }
                    return userDetails;

                }
                return null;

            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }



        //Edit profile- user can delete his profile

        public void DeleteUser(int userid)
        {

            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            int sumOfNumEff = 0;

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@UserID", userid);


            cmd = CreateCommandWithStoredProcedureGeneral("sp_DeleteUser", con, paramDic);

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                sumOfNumEff += numEffected;
            }
            catch (Exception ex)
            {
                // write to log
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
                throw (ex);
            }

            if (con != null)
            {
                // close the db connection
                con.Close();
            }


        }

        public int InsertUserTraits(UserTraits traits)
        {
            SqlConnection con;
            try
            {
                con = connect("myProjDB"); // משתמש בקונקשן סטנדרטי שלך
            }
            catch (Exception ex)
            {
                throw new Exception("Failed to connect to DB", ex);
            }

            try
            {
                // מילון פרמטרים לפרוצדורה
                Dictionary<string, object> paramDic = new Dictionary<string, object>
                {
                    { "@UserID", traits.UserID },
                    { "@SocialStyle", traits.SocialStyle.ToString() },
                    { "@GuidanceStyle", traits.GuidanceStyle.ToString() },
                    { "@CommunicationStyle", traits.CommunicationStyle.ToString() },
                    { "@LearningStyle", traits.LearningStyle.ToString() },
                    { "@JobExperienceLevel", traits.JobExperienceLevel.ToString() }
                };

                SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("InsertUserTraits", con, paramDic);
                cmd.CommandTimeout = 500;  // temporary , connection is having issues

                int rowsAffected = cmd.ExecuteNonQuery();
                return rowsAffected; // 1 אם הצליח
            }
            catch (Exception ex)
            {
                throw new Exception("Error inserting user traits", ex);
            }
            finally
            {
                con.Close();
            }
        }

        public UserTraits GetTraitsByUserId(int userId)
        {
            SqlConnection con;
            SqlCommand cmd;
            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            // List&lt;User&gt; users = new List&lt;User&gt;();
            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            paramDic.Add("@userID", userId);


            cmd = CreateCommandWithStoredProcedureGeneral("SP_GetUserTraitsByID", con, paramDic);
            cmd.CommandTimeout = 500;  // temporary , connection is having issues

            try
            {
                SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                if (dataReader.Read()) // if a result exists
                {
                    return new UserTraits
                    {
                        UserID = userId, // include this if you want to keep the user id in the object
                        SocialStyle = Enum.Parse<SocialStyle>(dataReader["SocialStyle"].ToString(), ignoreCase: true),
                        GuidanceStyle = Enum.Parse<GuidanceStyle>(dataReader["GuidanceStyle"].ToString(), ignoreCase: true),
                        CommunicationStyle = Enum.Parse<CommunicationStyle>(dataReader["CommunicationStyle"].ToString(), ignoreCase: true),
                        LearningStyle = Enum.Parse<LearningStyle>(dataReader["LearningStyle"].ToString(), ignoreCase: true),
                        JobExperienceLevel = Enum.Parse<JobExperienceLevel>(dataReader["JobExperienceLevel"].ToString(), ignoreCase: true)
                    };
                }

                return null; // Return null if no user is found
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    // close the db connection
                    con.Close();
                }
            }
        }



        ////MENTOR AND JOB SEEKER MATCH 
        ///
        public List<Mentor> FindBestMentor(int userID, string gender, bool mentorRole,
            List<string> mentorCompanies, string guidanceType, UserTraits userTraits,
            List <string> mentorLanguages, bool languageImportant,
            bool genderImportant, bool companyImportant)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            Dictionary<string, object> paramDic = new Dictionary<string, object>();
            var ishr = mentorRole ? 1 : 0;
            paramDic.Add("@MentorRole", ishr);
            paramDic.Add("@GuidanceType", guidanceType);
            paramDic.Add("@JobSeekerID", userID);

            var jobSeeker = ReadUser(userID);

            // Load weights from database
            var weights = LoadMatchingWeights(con);

            List<Mentor> mentors = new List<Mentor>();
            Dictionary<int, UserTraits> mentorTraitsDict = new Dictionary<int, UserTraits>(); // ✅ new dictionary

            cmd = CreateCommandWithStoredProcedureGeneral("SP_GetAvailableMentors", con, paramDic);
            cmd.CommandTimeout = 120;

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
                while (reader.Read())
                {
                    int mentorId = Convert.ToInt32(reader["UserID"]);

                    Mentor m = new Mentor
                    {
                        UserID = mentorId,
                        FirstName = reader["FirstName"].ToString(),
                        LastName = reader["LastName"].ToString(),
                        Email = reader["Email"].ToString(),
                        MentoringType = reader["MentoringType"].ToString(),
                        Company = reader["Companies"].ToString()
                            .Split(',')
                            .Select(s => s.Trim())
                            .ToList(),
                        IsHr = Convert.ToBoolean(reader["IsHr"]),
                        CareerField = reader["CareerFields"].ToString()
                            .Split(',')
                            .Select(s => s.Trim())
                            .ToList(),
                        Roles = reader["Roles"].ToString()
                            .Split(',')
                            .Select(s => s.Trim())
                            .ToList(),
                        Language = reader["Languages"].ToString()
                            .Split(',')
                            .Select(s => s.Trim())
                            .ToList(),
                        Experience = reader["Experience"].ToString(),
                        FacebookLink = reader["FacebookLink"].ToString(),
                        LinkedInLink = reader["LinkedInLink"].ToString(),
                        IsMentor = Convert.ToBoolean(reader["IsMentor"]),
                        OfferID = reader["OfferID"] != DBNull.Value ? Convert.ToInt32(reader["OfferID"]) : (int?)null,
                        Password = reader["Password"]?.ToString(),
                        Picture = reader["Picture"]?.ToString(),
                        Gender = reader["Gender"].ToString(),

                        // Optional: you can keep MatchCount here
                        MatchCount = reader["MatchCount"] != DBNull.Value ? Convert.ToInt32(reader["MatchCount"]) : 0
                    };

                    // ✅ Extract mentor traits into UserTraits object
                    UserTraits traits = new UserTraits
                    {
                        UserID = mentorId,
                        SocialStyle = Enum.TryParse(reader["SocialStyle"]?.ToString(), out SocialStyle socialStyle)
                        ? socialStyle
                        : default,

                        GuidanceStyle = Enum.TryParse(reader["GuidanceStyle"]?.ToString(), out GuidanceStyle guidanceStyle)
                        ? guidanceStyle
                        : default,

                        CommunicationStyle = Enum.TryParse(reader["CommunicationStyle"]?.ToString(), out CommunicationStyle communicationStyle)
                        ? communicationStyle
                        : default,

                        LearningStyle = Enum.TryParse(reader["LearningStyle"]?.ToString(), out LearningStyle learningStyle)
                        ? learningStyle
                        : default,
                        JobExperienceLevel = Enum.TryParse(reader["JobExperienceLevel"]?.ToString(), out JobExperienceLevel JobExperienceLevel)
                        ? JobExperienceLevel
                        : default
                    };

                    mentorTraitsDict[mentorId] = traits;
                    mentors.Add(m);
                }

                // Apply filters first
                var filtered = ApplyFilters(jobSeeker, mentors);

                // Score and sort mentors
                var scoredMentors = filtered
                    .Select(m => new
                    {
                        Mentor = m,
                        Score = CalculateMatchScore(jobSeeker, m, mentorCompanies, gender,
    userTraits, mentorTraitsDict[m.UserID], mentorLanguages,
    languageImportant, genderImportant, companyImportant, weights)

                    })
                    .OrderByDescending(x => x.Score)
                    .ThenBy(x => x.Mentor.MatchCount)
                    .Select(x => x.Mentor)
                    .ToList();


                ///insert into job seeker request table
                ///
                SqlConnection reqCon;
                SqlCommand reqCmd;
                int requestID; // ✅ Declare outside so it can be used later

                try
                {
                    reqCon = connect("myProjDB");
                }
                catch (Exception ex)
                {
                    throw ex;
                }

                try
                {
                    Dictionary<string, object> requestParams = new Dictionary<string, object>();
                    requestParams.Add("@JobSeekerID", userID);
                    requestParams.Add("@GenderPreference", gender ?? (object)DBNull.Value);
                    requestParams.Add("@MentorRoleRequired", mentorRole);
                    requestParams.Add("@GuidanceType", guidanceType ?? (object)DBNull.Value);
                    requestParams.Add("@LanguageImportant", languageImportant);
                    requestParams.Add("@GenderImportant", genderImportant);
                    requestParams.Add("@CompanyImportant", companyImportant);
                    requestParams.Add("@MentorLanguages", string.Join(",", mentorLanguages));
                    requestParams.Add("@MentorCompanies", string.Join(",", mentorCompanies));

                    requestParams.Add("@SocialStyle", userTraits.SocialStyle.ToString());
                    requestParams.Add("@GuidanceStyle", userTraits.GuidanceStyle.ToString());
                    requestParams.Add("@CommunicationStyle", userTraits.CommunicationStyle.ToString());
                    requestParams.Add("@LearningStyle", userTraits.LearningStyle.ToString());
                    requestParams.Add("@JobExperienceLevel", userTraits.JobExperienceLevel.ToString());

                    reqCmd = CreateCommandWithStoredProcedureGeneral("SP_InsertMatchingRequest", reqCon, requestParams);
                    requestID = (int)reqCmd.ExecuteScalar(); // This returns the inserted MatchingRequestID

                }
                catch (Exception ex)
                {
                    if (reqCon != null)
                        reqCon.Close();
                    throw ex;
                }

                if (reqCon != null)
                    reqCon.Close();


                // ✅ Insert top 5 matches into MatchHistory
                // ✅ Insert top 5 matches into MatchHistory
                SqlConnection insertCon;
                SqlCommand insertCmd;

                try
                {
                    insertCon = connect("myProjDB"); // create the connection
                }
                catch (Exception ex)
                {
                    // write to log
                    throw ex;
                }

                int position = 1;

                try
                {
                    foreach (var topMentor in scoredMentors)
                    {
                        double score = CalculateMatchScore(
                            jobSeeker, topMentor, mentorCompanies, gender,
                            userTraits, mentorTraitsDict[topMentor.UserID], mentorLanguages,
                            languageImportant, genderImportant, companyImportant, weights);

                        Dictionary<string, object> paramDict = new Dictionary<string, object>();
                        paramDict.Add("@JobSeekerID", userID);
                        paramDict.Add("@MentorID", topMentor.UserID);
                        paramDict.Add("@ScoreAtMatch", score);
                        paramDict.Add("@PositionInResults", position++);
                        paramDict.Add("@GuidanceType", guidanceType ?? (object)DBNull.Value);
                        paramDict.Add("@MatchingRequestID", requestID); // <- New!

                        insertCmd = CreateCommandWithStoredProcedureGeneral("SP_InsertMatchHistory", insertCon, paramDict);

                        int numEffected = insertCmd.ExecuteNonQuery(); // execute the command
                                                                       // (optional) handle affected rows if needed
                    }
                }
                catch (Exception ex)
                {
                    if (insertCon != null)
                    {
                        insertCon.Close();
                    }
                    throw ex;
                }

                if (insertCon != null)
                {
                    insertCon.Close();
                }


                return scoredMentors;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in FindBestMentor: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                throw;
            }
            finally
            {
                if (con != null) con.Close();
            }
        }


        // Load matching weights from database
        private Dictionary<string, double> LoadMatchingWeights(SqlConnection con)
        {
            Dictionary<string, double> weights = new Dictionary<string, double>();

            using (SqlCommand cmd = new SqlCommand("SP_GetMatchingWeights", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        string paramName = reader["ParameterName"].ToString();
                        double weight = Convert.ToDouble(reader["Weight"]);
                        weights[paramName] = weight;
                    }
                }
            }

            return weights;
        }

        // Apply filters based on your requirements
        private List<Mentor> ApplyFilters(User jobSeeker, List<Mentor> mentors)
        {
            return mentors.Where(mentor => {

                // Filter 3: Experience level - mentor should have more experience
                // Unless both have 5+ years, then we don't filter by this
                var seekerExp = ParseExperience(jobSeeker.Experience);
                var mentorExp = ParseExperience(mentor.Experience);

                if (seekerExp < 5 && mentorExp <= seekerExp) return false;

                return true;
            }).ToList();
        }

        // Updated scoring method using database weights and UserTraits
        private double CalculateMatchScore(User jobSeeker, Mentor mentor, List<string> mentorCompanies, string preferredGender,
     UserTraits seekerTraits, UserTraits mentorTraits,List<string> mentorLanguages,
     bool languageImportant, bool genderImportant, bool companyImportant,
     Dictionary<string, double> weights)
        {
            double score = 0;

            // Ensure collections are not null
            var mentorLang = mentor.Language ?? new List<string>();
            var seekerCareer = jobSeeker.CareerField ?? new List<string>();
            var mentorCareer = mentor.CareerField ?? new List<string>();
            var seekerRoles = jobSeeker.Roles ?? new List<string>();
            var mentorRoles = mentor.Roles ?? new List<string>();

            // 1. Language matching
            // 1. Language matching - check if mentor's language matches preferred languages
            var languageMatch = mentorLang.Intersect(mentorLanguages, StringComparer.OrdinalIgnoreCase).Any() ? 1.0 : 0.0;
            var languageWeight = languageImportant ? weights["LanguageImportant"] : weights["Language"];
            score += languageMatch * languageWeight;

            // 2. Gender matching
            var genderMatch = 0.0;
            if (!string.IsNullOrEmpty(preferredGender) &&
                !string.Equals(preferredGender, "No preference", StringComparison.OrdinalIgnoreCase) &&
                string.Equals(mentor.Gender, preferredGender, StringComparison.OrdinalIgnoreCase))
            {
                genderMatch = 1.0;
            }
            var genderWeight = genderImportant ? weights["GenderImportant"] : weights["Gender"];
            score += genderMatch * genderWeight;

            // 3. Career field matching - irrelevant for HR mentors
            if (!mentor.IsHr)
            {
                var careerMatch = seekerCareer.Intersect(mentorCareer, StringComparer.OrdinalIgnoreCase).Any() ? 1.0 : 0.0;
                score += careerMatch * weights["CareerField"];
            }
            
            // 4. Company matching
            var companyMatch = 0.0;
            var preferredMentorCompanies = mentorCompanies ?? new List<string>();

            if (preferredMentorCompanies.Any() && mentor.Company != null)
            {
                companyMatch = mentor.Company.Intersect(preferredMentorCompanies, StringComparer.OrdinalIgnoreCase).Any() ? 1.0 : 0.0;
            }

            var companyWeight = companyImportant ? weights["CompanyImportant"] : weights["Company"];
            score += companyMatch * companyWeight;

            // 5. Style matching using UserTraits (both seeker and mentor)
            if (seekerTraits != null && mentorTraits != null)
            {
                // Social Style matching
                if (seekerTraits.SocialStyle == mentorTraits.SocialStyle)
                {
                    score += 1.0 * weights["SocialStyle"];
                }

                // Guidance Style matching
                if (seekerTraits.GuidanceStyle == mentorTraits.GuidanceStyle)
                {
                    score += 1.0 * weights["GuidanceStyle"];
                }

                // Communication Style matching
                if (seekerTraits.CommunicationStyle == mentorTraits.CommunicationStyle)
                {
                    score += 1.0 * weights["CommunicationStyle"];
                }

                // Learning Style matching
                if (seekerTraits.LearningStyle == mentorTraits.LearningStyle)
                {
                    score += 1.0 * weights["LearningStyle"];
                }
                if (seekerTraits.JobExperienceLevel == mentorTraits.JobExperienceLevel)
                {
                    score += 1.0 * weights["JobExperienceLevel"];
                }

            }
            // 6. Role (sub-role) matching
            var roleMatch = seekerRoles.Intersect(mentorRoles, StringComparer.OrdinalIgnoreCase).Any() ? 1.0 : 0.0;
            score += roleMatch * weights["Role"]; // הוסף מפתח כזה ב־weights או קבע ערך ברירת מחדל

            // Load balancing penalty (reduces score for overloaded mentors)
            if (mentor.MatchCount > 3)
            {
                score -= 0.05 * (mentor.MatchCount - 3);
            }

            return Math.Max(0, score); // Ensure score doesn't go negative
        }


        // Keep your existing helper method
        private int ParseExperience(string exp)
        {
            if (string.IsNullOrEmpty(exp))
                return 0;

            Match match = Regex.Match(exp, @"\d+");
            if (match.Success)
            {
                return int.Parse(match.Value);
            }
            return 0;
        }
        public DataTable GetMatchingFeatureData()
        {
            using (SqlConnection con = connect("myProjDB"))
            using (SqlCommand cmd = new SqlCommand("SP_GetMatchingFeatureData", con))
            {
                cmd.CommandType = CommandType.StoredProcedure;
                using (SqlDataAdapter da = new SqlDataAdapter(cmd))
                {
                    DataTable dt = new DataTable();
                    da.Fill(dt);
                    return dt;
                }
            }
        }

        ///this is the smart algorithm



    

      
       

        public List<User> ReadAllUsers()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB");
            }
            catch (Exception ex)
            {
                throw ex;
            }

            List<User> users = new List<User>();

            cmd = CreateCommandWithStoredProcedureGeneral("sp_ReadAllUserDetails", con, new Dictionary<string, object>());
            cmd.CommandTimeout = 500;

            try
            {
                SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                while (reader.Read())
                {
                    bool isMentor = Convert.ToBoolean(reader["IsMentor"]);
                    User user = isMentor ? new Mentor() : new User();

                    user.UserID = Convert.ToInt32(reader["UserID"]);
                    user.FirstName = reader["FirstName"].ToString();
                    user.LastName = reader["LastName"].ToString();
                    user.Email = reader["Email"].ToString();
                    user.Password = reader["Password"].ToString();
                    user.Picture = reader["Picture"].ToString();
                    user.Experience = reader["Experience"].ToString();
                    user.FacebookLink = reader["FacebookLink"].ToString();
                    user.LinkedInLink = reader["LinkedInLink"].ToString();
                    user.IsMentor = isMentor;

                    user.Language = reader["LanguageNames"].ToString()
                        .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries).ToList();

                    user.CareerField = reader["CareerFieldNames"].ToString()
                        .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries).ToList();

                    user.Roles = reader["RolesNames"].ToString()
                        .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries).ToList();

                    user.Company = reader["CompaniesNames"].ToString()
                        .Split(new[] { ", " }, StringSplitOptions.RemoveEmptyEntries).ToList();

                    if (isMentor && user is Mentor mentor)
                    {
                        mentor.MentoringType = reader["MentoringType"]?.ToString();
                        mentor.IsHr = reader["IsHr"] != DBNull.Value && Convert.ToBoolean(reader["IsHr"]);
                        mentor.Gender = reader["Gender"]?.ToString();
                    }

                    users.Add(user);
                }

                return users;
            }
            catch (Exception ex)
            {
                throw ex;
            }
            finally
            {
                if (con != null)
                    con.Close();
            }
        }

    
        public int ConfirmMentorSelection(int jobSeekerId, int mentorId)
        {
            SqlConnection con = connect("myProjDB");

            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                ["@JobSeekerID"] = jobSeekerId,
                ["@MentorID"] = mentorId
            };

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_ConfirmMentorSelection", con, paramDic);

            SqlParameter outputParam = new SqlParameter("@MatchID", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(outputParam);

            cmd.ExecuteNonQuery();

            con.Close();

            return Convert.ToInt32(outputParam.Value); // 0 if failed, MatchID if succeeded
        }

        public List<Dictionary<string, object>> ReadAllUserMatches(int userId, string userType)
        {
            List<Dictionary<string, object>> matches = new List<Dictionary<string, object>>();

            using (SqlConnection conn = connect("myProjDB"))
            using (SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_AllUserMatches", conn,
                new Dictionary<string, object>
                {
            { "@UserID", userId },
            { "@UserType", userType }
                }))
            {
                cmd.CommandTimeout = 500;

                try
                {
                    SqlDataReader reader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

                    while (reader.Read())
                    {
                        var row = new Dictionary<string, object>();

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            row[reader.GetName(i)] = reader.IsDBNull(i) ? null : reader.GetValue(i);
                        }

                        matches.Add(row);
                    }

                    return matches;
                }
                catch (Exception ex)
                {
                    throw ex;
                }
                finally
                {
                    if (conn != null)
                        conn.Close();
                }
            }
        }


        public bool LinkFileToSession(int sessionId, int fileId, int userId)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                SqlCommand cmd = new SqlCommand("SP_LinkFileToSession", con);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@SessionID", sessionId);
                cmd.Parameters.AddWithValue("@FileID", fileId);
                cmd.Parameters.AddWithValue("@UserID", userId);

                try
                {
                    cmd.ExecuteNonQuery();
                    return true;
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error linking file to session: " + ex.Message);
                    return false;
                }
            }
        }


        /// NEW BATEL CHECKING 
        public List<UserFile> GetSessionFiles(int sessionId)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                SqlCommand cmd = new SqlCommand("SP_GetSessionFiles", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@SessionID", sessionId);

                List<UserFile> files = new List<UserFile>();

                try
                {
                    SqlDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        UserFile file = new UserFile
                        {
                            FileID = reader.GetInt32("FileID"),
                            FileName = reader.GetString("FileName"),
                            FilePath = reader.IsDBNull("FilePath") ? null : reader.GetString("FilePath"),
                            FileType = reader.IsDBNull("FileType") ? null : reader.GetString("FileType"),
                            UserID = reader.GetInt32("UserID")
                        };
                        files.Add(file);
                    }
                    reader.Close();
                }

                catch (Exception ex)
                {
                    Console.WriteLine("Error getting session files: " + ex.Message);
                    throw;
                }

                return files;
            }
        }

        public bool RemoveFileFromSession(int sessionId, int fileId)
        {
            using (SqlConnection con = connect("myProjDB"))
            {
                SqlCommand cmd = new SqlCommand("SP_RemoveFileFromSession", con);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@SessionID", sessionId);
                cmd.Parameters.AddWithValue("@FileID", fileId);

                try
                {
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Error removing file from session: " + ex.Message);
                    return false;
                }
            }
        }
        /// 



        public bool DoesUserFileExist(int userId, string fileName)
        {
            using (SqlConnection conn = connect("myProjDB"))
            {
                string query = "SELECT COUNT(*) FROM UserFiles WHERE UserID = @UserID AND FileName = @FileName";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@UserID", userId);
                    cmd.Parameters.AddWithValue("@FileName", fileName);


                    int count = (int)cmd.ExecuteScalar();
                    return count > 0;
                }
            }
        }

        //shahar

        public void SetActiveVersion(int version)
        {
            using (SqlConnection conn = connect("myProjDB"))
            {


                var cmd = new SqlCommand("SetActiveWeightVersion", conn);
                cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@WeightVersionID", version);

                cmd.ExecuteNonQuery();

                conn.Close();
            }
        }

        public void ImportWeight(int version, string paramName, double weight)
        {


            using (SqlConnection conn = connect("myProjDB"))
            {



                var cmd = new SqlCommand("SP_ImportWeightsForVersion", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@WeightVersionID", version);
                cmd.Parameters.AddWithValue("@ParameterName", paramName);
                cmd.Parameters.AddWithValue("@WeightValue", weight);

                cmd.ExecuteNonQuery();

                conn.Close();
            }
        }

        public bool IsVersionImported(int version)
        {
            using (SqlConnection conn = connect("myProjDB"))
            {

                string sql = "SELECT COUNT(*) FROM MatchingWeights WHERE WeightVersionID = @version";

                var cmd = new SqlCommand(sql, conn);
                cmd.Parameters.AddWithValue("@version", version);

                int count = (int)cmd.ExecuteScalar();

                conn.Close();

                return count > 0;
            }
        }


        ///this is the smart algorithm



        public int GetLatestVersion()
        {
            int latestVersion = 0;

            using (SqlConnection conn = connect("myProjDB"))
            {

                Console.WriteLine("✅ Connection opened for GetLatestVersion");

                var cmd = new SqlCommand("SELECT MAX(WeightVersionID) FROM MatchingWeightVersions", conn);
                var result = cmd.ExecuteScalar();

                if (result != null && result != DBNull.Value)
                {
                    latestVersion = Convert.ToInt32(result);
                    Console.WriteLine($" Latest version found: {latestVersion}");
                }
                else
                {
                    Console.WriteLine(" No version found in DB. Returning 0");
                }
            }

            return latestVersion;
        }


        public List<int> GetAllVersions()
        {
            List<int> versions = new List<int>();

            using (var conn = connect("myProjDB"))
            {
                conn.Open();
                var cmd = new SqlCommand("SELECT WeightVersionID FROM MatchingWeightVersions ORDER BY WeightVersionID DESC", conn);
                var reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    versions.Add(reader.GetInt32(0));
                }
            }

            return versions;
        }



        public int InsertNewVersion()
        {
            Console.WriteLine("👉 Opening new connection for InsertNewVersion...");
            using (SqlConnection conn = connect("myProjDB"))
            {
                Console.WriteLine("✅ Connection opened.");


                var cmd = new SqlCommand("sp_InsertMatchingWeightVersion", conn);
                cmd.CommandType = CommandType.StoredProcedure;

                var newVersionID = (int)cmd.ExecuteScalar();

                Console.WriteLine($"✅ Inserted new version ID {newVersionID}");

                return newVersionID;
            }
        }


        public int GetActiveVersion()
        {
            using (SqlConnection conn = connect("myProjDB"))
            {
                var cmd = new SqlCommand(@"
     SELECT TOP 1 WeightVersionID
     FROM MatchingWeightVersions
     WHERE IsActiveVersion = 1", conn);

                var result = cmd.ExecuteScalar();
                return (result != null && result != DBNull.Value) ? Convert.ToInt32(result) : 0;
            }
        }


    }
}
