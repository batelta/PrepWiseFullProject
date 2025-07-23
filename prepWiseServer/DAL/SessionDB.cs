namespace prepWise.DAL;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Data;
using System.Text;
using System.Xml.Linq;
using prepWise.Controllers; //משתנה לפי שם הפרויקט
using prepWise.BL;//משתנה לפי שם הפרויקט
using System.Diagnostics.Eventing.Reader;
using Microsoft.Data.SqlClient;
public class SessionDB
{

    public SessionDB()
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
    public int InsertSession(Session session)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@JourneyID"] = session.JourneyID,
            ["@ScheduledAt"] = session.ScheduledAt,
            ["@Status"] = session.Status ?? "scheduled",
            ["@Notes"] = session.Notes ?? (object)DBNull.Value,
            ["@MeetingUrl"] = session.MeetingUrl ?? (object)DBNull.Value
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertSession", con, paramDic);

        try
        {
            object result = cmd.ExecuteScalar();
            return (result != null) ? Convert.ToInt32(result) : -1;
        }
        catch (Exception ex)
        {
            Console.WriteLine("InsertSession error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }


    public void MarkJourneyAsMultipleSessions(int journeyId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@JourneyID"] = journeyId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_MarkJourneyAsMultipleSessions", con, paramDic);

        try
        {
            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            Console.WriteLine("MarkJourneyAsMultipleSessions error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }


    /// <summary>
    ///USING THIS ONE
    public List<Session> GetSessionsByUsersIDs(int jobseekerID, int mentorID)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@jobseekerID"] = jobseekerID,
            ["@mentorID"] = mentorID
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetSessionsByUserId", con, paramDic);
        SqlDataReader dr = cmd.ExecuteReader();

        List<Session> sessions = new List<Session>();
        while (dr.Read())
        {
            sessions.Add(new Session
            {
                SessionID = (int)dr["SessionID"],
                JourneyID = (int)dr["JourneyID"],
                ScheduledAt = dr["ScheduledAt"] == DBNull.Value ? null : (DateTime?)dr["ScheduledAt"],
                Status = dr["status"].ToString(),
                Notes = dr["notes"]?.ToString(),
                MeetingUrl = dr["MeetingUrl"]?.ToString(),
            });
        }

        con.Close();
        return sessions;
    }


    public List<MentorSessionView> GetPendingSessionsForMentor(int mentorId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@mentorId"] = mentorId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetPendingSessionsForMentor", con, paramDic);
        SqlDataReader dr = cmd.ExecuteReader();

        List<MentorSessionView> sessions = new List<MentorSessionView>();
        while (dr.Read())
        {
            sessions.Add(new MentorSessionView
            {
                SessionID = (int)dr["SessionID"],
                JourneyID = (int)dr["JourneyID"],
                ScheduledAt = dr["ScheduledAt"] == DBNull.Value ? null : (DateTime?)dr["ScheduledAt"],
                Status = dr["Status"].ToString(),
                Notes = dr["Notes"]?.ToString(),

                JobSeekerID = (int)dr["JobSeekerID"],
                JobSeekerFirstName = dr["FirstName"].ToString(),
                JobSeekerLastName = dr["LastName"].ToString(),
                JobSeekerPicture = dr["Picture"]?.ToString()
            });
        }

        con.Close();
        return sessions;
    }

    public bool CheckIfPendingSessionExists(int journeyID)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@JourneyID"] = journeyID
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_CheckIfPendingSessionExists", con, paramDic);

        try
        {
            object result = cmd.ExecuteScalar();
            return result != null && Convert.ToInt32(result) > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine("CheckIfPendingSessionExists error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }


    //Update session's status
    public bool UpdateSessionStatus(int sessionID, string status)
    {
        try
        {
            SqlConnection con = connect("myProjDB");

            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                ["@SessionID"] = sessionID,
                ["@Status"] = status
            };

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_UpdateSessionStatus", con, paramDic);

            // הוספת פרמטר חזרה לבדיקה אם הפעולה הצליחה
            SqlParameter returnParameter = new SqlParameter("@ReturnValue", SqlDbType.Int)
            {
                Direction = ParameterDirection.ReturnValue
            };
            cmd.Parameters.Add(returnParameter);

            int rowsAffected = cmd.ExecuteNonQuery();
            con.Close();

            // בדיקת ערך החזרה מהפרוצדורה
            int returnValue = (int)returnParameter.Value;
            return returnValue == 1;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error updating session status: {ex.Message}");
            return false;
        }
    }




    public Session GetSessionById(int sessionId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@SessionID"] = sessionId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetSessionById", con, paramDic);
        SqlDataReader dr = cmd.ExecuteReader();

        Session s = null;
        if (dr.Read())
        {
            s = new Session
            {
                SessionID = (int)dr["SessionID"],
                JourneyID = (int)dr["JourneyID"],
                ScheduledAt = dr["ScheduledAt"] == DBNull.Value ? null : (DateTime?)dr["ScheduledAt"],
                Status = dr["status"].ToString(),
                Notes = dr["notes"]?.ToString(),
                MeetingUrl = dr["MeetingUrl"]?.ToString(),
            };
        }

        con.Close();
        return s;
    }


    public bool UpdateSession(Session session)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@SessionID"] = session.SessionID,
            ["@ScheduledAt"] = session.ScheduledAt ??(object)DBNull.Value,
            ["@Status"] = session.Status ?? "scheduled",
            ["@MeetingUrl"] = session.MeetingUrl ?? (object)DBNull.Value,
            ["@Notes"] = session.Notes ?? (object)DBNull.Value
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateSession", con, paramDic);

        try
        {
            int rowsAffected = cmd.ExecuteNonQuery();
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine("UpdateSession error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }



    public Dictionary<string, object> GetSessionFeedback(int sessionId,int userID)
    {
        SqlConnection con = connect("myProjDB");
        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@SessionID"] = sessionId,
            ["@UserID"] = userID

        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetSessionFeedback", con, paramDic);

        try
        {
            SqlDataReader reader = cmd.ExecuteReader();
            if (reader.Read())
            {
                return new Dictionary<string, object>
                {
                    ["rating"] = Convert.ToInt32(reader["rating"]),
                    ["comment"] = reader["comment"].ToString()
                };
            }
            return null;
        }
        catch (Exception ex)
        {
            Console.WriteLine("GetSessionFeedback error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }

    public bool UpsertSessionFeedback(int sessionId, int submittedBy, double rating, string comment)
    {
        SqlConnection con = connect("myProjDB");
        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@SessionID"] = sessionId,
            ["@SubmittedBy"] = submittedBy,
            ["@Rating"] = rating,
            ["@Comment"] = comment ?? (object)DBNull.Value
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateOrInsertSessionFeedback", con, paramDic);

        try
        {
            int rowsAffected = cmd.ExecuteNonQuery();
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine("UpsertSessionFeedback error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }

    public int InsertTask(int sessionID, string title, string description,int jobSeekerID)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@SessionID"] = sessionID,
            ["@Title"] = title,
            ["@Description"] = description,
            ["@JobSeekerID"]=jobSeekerID
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertTask", con, paramDic);

        try
        {
            object result = cmd.ExecuteScalar();
            return (result != null) ? Convert.ToInt32(result) : -1;
        }
        catch (Exception ex)
        {
            Console.WriteLine("InsertTask error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }


    public List<Dictionary<string, object>> GetTasksBySession(int sessionID)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@SessionID"] = sessionID
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetTasksBySession", con, paramDic);
        SqlDataReader dr = cmd.ExecuteReader();

        List<Dictionary<string, object>> tasks = new List<Dictionary<string, object>>();

        while (dr.Read())
        {
            var task = new Dictionary<string, object>
            {
                ["TaskID"] = dr["TaskID"],
                ["SessionID"] = dr["SessionID"],
                ["Title"] = dr["Title"].ToString(),
                ["Description"] = dr["Description"]?.ToString(),
                ["CreatedAt"] = Convert.ToDateTime(dr["CreatedAt"]),
                ["IsArchived"] = Convert.ToBoolean(dr["IsArchived"])
            };

            tasks.Add(task);
        }

        con.Close();
        return tasks;
    }

    public bool UpsertTaskCompletion(int taskID, int jobSeekerID, bool isCompleted)
    {
        SqlConnection con = connect("myProjDB");
        {
            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_UpsertTaskCompletion", con,
                new Dictionary<string, object>
                {
                { "@TaskID", taskID },
                { "@JobSeekerID", jobSeekerID },
                { "@IsCompleted", isCompleted }
                });

            int rowsAffected = cmd.ExecuteNonQuery();
            con.Close();
            return rowsAffected > 0;
        }
    }

    public List<int> GetCompletedTasksForSession(int sessionId, int jobSeekerId)
    {
        List<int> completedTaskIds = new List<int>();

        using (SqlConnection con = connect("myProjDB"))
        {
            SqlCommand cmd = new SqlCommand("SP_GetCompletedTasksForSession", con);
            cmd.CommandType = CommandType.StoredProcedure;
            cmd.Parameters.AddWithValue("@SessionID", sessionId);
            cmd.Parameters.AddWithValue("@JobSeekerID", jobSeekerId);

            try
            {
                SqlDataReader reader = cmd.ExecuteReader();
                while (reader.Read())
                {
                    completedTaskIds.Add(reader.GetInt32(0)); // TaskID
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error fetching completed tasks: " + ex.Message);
                throw;
            }
        }

        return completedTaskIds;
    }



    public Dictionary<string, int> GetTaskProgressForJobSeeker(int jobSeekerId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@JobSeekerID"] = jobSeekerId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_GetTaskProgressForJobSeeker", con, paramDic);
        SqlDataReader dr = cmd.ExecuteReader();

        Dictionary<string, int> progress = new Dictionary<string, int>
    {
        { "TotalTasks", 0 },
        { "CompletedTasks", 0 }
    };

        if (dr.Read())
        {
            progress["TotalTasks"] = dr["TotalTasks"] != DBNull.Value ? (int)dr["TotalTasks"] : 0;
            progress["CompletedTasks"] = dr["CompletedTasks"] != DBNull.Value ? (int)dr["CompletedTasks"] : 0;
        }

        con.Close();
        return progress;
    }

    public bool DeleteTask(int taskId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@TaskID"] = taskId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteTask", con, paramDic);

        try
        {
            int rowsAffected = cmd.ExecuteNonQuery();
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine("DeleteTask error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }
    public bool UpdateTask(int taskId, string title, string description)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@TaskID"] = taskId,
            ["@Title"] = title,
            ["@Description"] = description
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateTask", con, paramDic);

        try
        {
            int rowsAffected = cmd.ExecuteNonQuery();
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            Console.WriteLine("UpdateTask error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }

    public class MentorSessionView
    {
        public int SessionID { get; set; }
        public int JourneyID { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public string Status { get; set; }
        public string? Notes { get; set; }

        // Minimal user fields for display
        public int JobSeekerID { get; set; }
        public string JobSeekerFirstName { get; set; }
        public string JobSeekerLastName { get; set; }
        public string JobSeekerPicture { get; set; }
    }


    public List<MentorSessionView> GetUpcomingSessionsForMentorView(int mentorId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@MentorID"] = mentorId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_GetUpcomingSessionsForMentor", con, paramDic);
        SqlDataReader dr = cmd.ExecuteReader();

        List<MentorSessionView> sessions = new List<MentorSessionView>();
        while (dr.Read())
        {
            MentorSessionView s = new MentorSessionView
            {
                SessionID = (int)dr["SessionID"],
                JourneyID = (int)dr["JourneyID"],
                ScheduledAt = (DateTime)dr["ScheduledAt"],
                Status = dr["Status"].ToString(),
                Notes = dr["Notes"]?.ToString(),

                JobSeekerID = (int)dr["JobSeekerID"],
                JobSeekerFirstName = dr["FirstName"].ToString(),
                JobSeekerLastName = dr["LastName"].ToString(),
                JobSeekerPicture = dr["Picture"]?.ToString()
            };

            sessions.Add(s);
        }

        con.Close();
        return sessions;
    }

 

    public bool ArchiveSession(int sessionId)
    {
        SqlConnection con = connect("myProjDB");
        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@SessionID"] = sessionId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("sp_ArchiveSession", con, paramDic);
        int rowsAffected = cmd.ExecuteNonQuery();
        con.Close();

        return rowsAffected > 0; // Return true if at least one row was updated
    }




    public int InsertMentorOffer(MentorOffer offer)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@MentorUserID"] = offer.MentorUserID,
            ["@Title"] = offer.Title,
            ["@Description"] = offer.Description,
            ["@OfferType"] = offer.OfferType,
            ["@DateTime"] = offer.DateTime,
            ["@DurationMinutes"] = offer.DurationMinutes,
            ["@MaxParticipants"] = offer.MaxParticipants,
            ["@IsOnline"] = offer.IsOnline,
            ["@Location"] = offer.Location ?? (object)DBNull.Value,
            ["@MeetingLink"] = offer.MeetingLink ?? (object)DBNull.Value,
            ["@CareerFieldIDs"] = string.Join(",", offer.CareerFieldIDs)
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertMentorOffer", con, paramDic);

        try
        {
            SqlDataReader reader = cmd.ExecuteReader();

            int newOfferId = 0;

            if (reader.Read())
            {
                newOfferId = reader.GetInt32(reader.GetOrdinal("NewOfferID"));
            }

            reader.Close();
            return newOfferId;
        }
        catch (Exception ex)
        {
            Console.WriteLine("InsertMentorOffer error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }
    public List<MentorOffer> GetMentorOffers(int? mentorUserId = null)
    {
        List<MentorOffer> offers = new List<MentorOffer>();

        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@MentorUserID"] = mentorUserId.HasValue ? mentorUserId.Value : (object)DBNull.Value
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetMentorOffers", con, paramDic);

        try
        {
            SqlDataReader reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                MentorOffer offer = new MentorOffer
                {
                    OfferID = reader.GetInt32(reader.GetOrdinal("OfferID")),
                    MentorUserID = reader.GetInt32(reader.GetOrdinal("MentorUserID")),
                    Title = reader.GetString(reader.GetOrdinal("Title")),
                    Description = reader.GetString(reader.GetOrdinal("Description")),
                    OfferType = reader.GetString(reader.GetOrdinal("OfferType")),
                    DateTime = reader.GetDateTime(reader.GetOrdinal("DateTime")),
                    DurationMinutes = reader.GetInt32(reader.GetOrdinal("DurationMinutes")),
                    MaxParticipants = reader.GetInt32(reader.GetOrdinal("MaxParticipants")),
                    CurrentParticipants = reader.GetInt32(reader.GetOrdinal("CurrentParticipants")),
                    Location = reader.GetString(reader.GetOrdinal("Location")),
                    IsOnline = reader.GetBoolean(reader.GetOrdinal("IsOnline")),
                    MeetingLink = reader.GetString(reader.GetOrdinal("MeetingLink")),
                    Status = reader.GetString(reader.GetOrdinal("Status")),
                    CreatedAt = reader.GetDateTime(reader.GetOrdinal("CreatedAt")),
                    CareerFieldIDs = reader["CareerFieldIDs"] != DBNull.Value
                        ? reader.GetString(reader.GetOrdinal("CareerFieldIDs"))
                            .Split(',')
                            .Where(s => !string.IsNullOrWhiteSpace(s))
                            .Select(int.Parse)
                            .ToList()
                        : new List<int>()
                };

                offers.Add(offer);
            }

            reader.Close();
        }
        catch (Exception ex)
        {
            Console.WriteLine("GetMentorOffers error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }

        //  עדכון סטטוס לאירועים שעברו
        foreach (var offer in offers)
        {
            if (offer.DateTime < DateTime.UtcNow && offer.Status == "Active")
            {
                offer.Status = "Completed"; // משנה את הסטטוס ברשימה שחוזרת ללקוח
                UpdateOfferStatusInDB(offer.OfferID, "Completed"); // מעדכן ב-DB
            }
        }

        return offers;
    }

    private void UpdateOfferStatusInDB(int offerId, string newStatus)
    {
        using (SqlConnection con = connect("myProjDB"))
        using (SqlCommand cmd = new SqlCommand("UPDATE MentorOffer SET Status=@Status WHERE OfferID=@OfferID", con))
        {
            cmd.Parameters.AddWithValue("@Status", newStatus);
            cmd.Parameters.AddWithValue("@OfferID", offerId);

            cmd.ExecuteNonQuery();
        }
    }

  

    public bool RegisterUserToOffer(int offerId, int userId)
    {
        using (SqlConnection con = connect("myProjDB"))
        using (SqlCommand cmd = new SqlCommand("SP_RegisterUserToOffer", con))
        {
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@OfferID", offerId);
            cmd.Parameters.AddWithValue("@UserID", userId);

            SqlParameter successParam = new SqlParameter("@Success", SqlDbType.Bit)
            {
                Direction = ParameterDirection.Output
            };
            cmd.Parameters.Add(successParam);

            cmd.ExecuteNonQuery();

            var raw = successParam.Value;
            Console.WriteLine("DEBUG => Raw OUTPUT: " + (raw == DBNull.Value ? "NULL" : raw.ToString()));

            bool success = raw != DBNull.Value && (bool)raw;
            Console.WriteLine("DEBUG => success bool = " + success);

            return success;
        }
    }




    public List<UserRegistrationDTO> GetMyRegistrations(int userId)
    {
        List<UserRegistrationDTO> registrations = new List<UserRegistrationDTO>();

        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@UserID"] = userId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetMyRegistrations", con, paramDic);

        try
        {
            SqlDataReader reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                UserRegistrationDTO reg = new UserRegistrationDTO
                {
                    OfferID = reader.GetInt32(reader.GetOrdinal("OfferID")),
                    OfferTitle = reader.GetString(reader.GetOrdinal("OfferTitle")),
                    OfferDateTime = reader.GetDateTime(reader.GetOrdinal("OfferDateTime")),
                    MentorName = reader.GetString(reader.GetOrdinal("MentorName")),
                    MeetingLink = reader.GetString(reader.GetOrdinal("MeetingLink")),
                    CurrentParticipants = reader.GetInt32(reader.GetOrdinal("CurrentParticipants")),
                    MaxParticipants = reader.GetInt32(reader.GetOrdinal("MaxParticipants")),
                    IsOnline = reader.GetBoolean(reader.GetOrdinal("IsOnline")),
                    Location = reader.GetString(reader.GetOrdinal("Location")),
                    CareerFieldIDs = reader["CareerFieldIDs"] != DBNull.Value
                        ? reader.GetString(reader.GetOrdinal("CareerFieldIDs"))
                            .Split(',')
                            .Where(s => !string.IsNullOrWhiteSpace(s))
                            .Select(int.Parse)
                            .ToList()
                        : new List<int>()
                };

                registrations.Add(reg);
            }

            reader.Close();
        }
        catch (Exception ex)
        {
            Console.WriteLine("GetMyRegistrations error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }

        return registrations;
    }

    public bool UpdateMentorOffer(MentorOffer offer)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@OfferID"] = offer.OfferID,
            ["@Title"] = offer.Title,
            ["@Description"] = offer.Description,
            ["@OfferType"] = offer.OfferType,
            ["@DateTime"] = offer.DateTime,
            ["@DurationMinutes"] = offer.DurationMinutes,
            ["@MaxParticipants"] = offer.MaxParticipants,
            ["@IsOnline"] = offer.IsOnline,
            ["@Location"] = offer.Location ?? (object)DBNull.Value,
            ["@MeetingLink"] = offer.MeetingLink ?? (object)DBNull.Value,
            ["@CareerFieldIDs"] = string.Join(",", offer.CareerFieldIDs)
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateMentorOffer", con, paramDic);

        try
        {
            //int rowsAffected = cmd.ExecuteNonQuery();
            //return rowsAffected > 0;
            cmd.ExecuteNonQuery(); // אפילו אם rowsAffected == 0
            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine("UpdateMentorOffer error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }
    public bool DeleteMentorOffer(int offerId)
    {
        using (SqlConnection con = connect("myProjDB"))
        {
            SqlCommand cmd = new SqlCommand("SP_DeleteMentorOffer", con);
            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@OfferID", offerId);

            try
            {
                int affectedRows = cmd.ExecuteNonQuery();
                return affectedRows > 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine("DeleteMentorOffer error: " + ex.Message);
                throw;
            }
        }
    }


    public List<MentorOffer> GetMentorOffersForUser(int userId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@UserID"] = userId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetMentorOffersForUserByCareers", con, paramDic);

        List<MentorOffer> offers = new List<MentorOffer>();

        try
        {
            SqlDataReader reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                MentorOffer offer = new MentorOffer
                {
                    OfferID = (int)reader["OfferID"],
                    MentorUserID = (int)reader["MentorUserID"],
                    Title = reader["Title"].ToString(),
                    Description = reader["Description"].ToString(),
                    OfferType = reader["OfferType"].ToString(),
                    DateTime = (DateTime)reader["DateTime"],
                    DurationMinutes = (int)reader["DurationMinutes"],
                    MaxParticipants = (int)reader["MaxParticipants"],
                    CurrentParticipants = (int)reader["CurrentParticipants"],
                    Location = reader["Location"].ToString(),
                    IsOnline = (bool)reader["IsOnline"],
                    MeetingLink = reader["MeetingLink"].ToString(),
                    Status = reader["Status"].ToString(),
                    CreatedAt = (DateTime)reader["CreatedAt"],
                    CareerFieldIDs = reader["CareerFieldIDs"].ToString().Split(',').Select(int.Parse).ToList()
                };

                offers.Add(offer);
            }

            return offers;
        }
        catch (Exception ex)
        {
            Console.WriteLine("GetMentorOffersForUser error: " + ex.Message);
            throw;
        }
        finally
        {
            con.Close();
        }
    }

    public MentorOffer GetMentorOfferById(int offerId)
    {
        SqlConnection con = connect("myProjDB");

        Dictionary<string, object> paramDic = new Dictionary<string, object>
        {
            ["@OfferID"] = offerId
        };

        SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_GetMentorOfferById", con, paramDic);

        SqlDataReader reader = cmd.ExecuteReader();

        MentorOffer offer = null;

        if (reader.Read())
        {
            offer = new MentorOffer
            {
                OfferID = (int)reader["OfferID"],
                MentorUserID = (int)reader["MentorUserID"],
                Title = reader["Title"].ToString(),
                Description = reader["Description"].ToString(),
                OfferType = reader["OfferType"].ToString(),
                DateTime = (DateTime)reader["DateTime"],
                DurationMinutes = (int)reader["DurationMinutes"],
                MaxParticipants = (int)reader["MaxParticipants"],
                CurrentParticipants = (int)reader["CurrentParticipants"],
                Location = reader["Location"].ToString(),
                IsOnline = (bool)reader["IsOnline"],
                MeetingLink = reader["MeetingLink"].ToString(),
                Status = reader["Status"].ToString(),
                CreatedAt = (DateTime)reader["CreatedAt"],
                CareerFieldIDs = reader["CareerFieldIDs"].ToString().Split(',').Select(int.Parse).ToList()
            };
        }

        reader.Close();
        con.Close();
        return offer;
    }


    public bool UnregisterFromMentorOffer(int userId, int offerId)
    {
        SqlConnection con = connect("myProjDB");

        try
        {
            Dictionary<string, object> paramDic = new Dictionary<string, object>
            {
                ["@UserID"] = userId,
                ["@OfferID"] = offerId
            };

            SqlCommand cmd = CreateCommandWithStoredProcedureGeneral("SP_UnregisterFromMentorOffer", con, paramDic);

            SqlDataReader reader = cmd.ExecuteReader();

            if (reader.Read())
            {
                int result = (int)reader["Result"];
                return result == 1;
            }

            return false;
        }
        catch
        {
            throw;
        }
        finally
        {
            con.Close();
        }
    }





}
