using Microsoft.Data.SqlClient;
using prepWise.DAL;
using System.Data;

namespace prepWise.BL
{
    public class User
    {
       public int UserID { get; set; }
       public string FirstName { get; set; }
       public string LastName { get; set; }
       public string Email { get; set; }
       public string Password { get; set; }
       public string Picture { get; set; }
       public List<string> CareerField { get; set; }
        public List<string> Roles { get; set; }
        public List<string> Company { get; set; }  // Optional for JobSeeker, Required for Mentor

        public string Experience { get; set; }
       public List<string> Language { get; set; }
       public string FacebookLink { get; set; }
       public string LinkedInLink { get; set; }
       public bool IsMentor { get; set; }


        //empty constractor
        public User()
        {
            
        }

        public User(int userID, string firstName, string lastName, string email,
            string password, string picture, List<string> careerField, List<string> roles, 
            List<string> company, string experience,
            List<string> language, string facebookLink, string linkedInLink,bool isMentor)


        {
            UserID = userID;
            FirstName = firstName;
            LastName = lastName;
            Email = email;
            Password = password;
            Picture = picture;
            CareerField = careerField;
            Roles = roles;
            Company = company;
            Experience = experience;
            Language = language;
            FacebookLink = facebookLink;
            LinkedInLink = linkedInLink;
        }

        public List<User> GetAllUsers()
        {
            UsersDB db = new UsersDB();
            return db.ReadAllUsers(); // ⬅️ פונקציה שמחזירה List<User>
        }
        public int insertNewUser(UserFile? file = null)
        {
            UsersDB dbs = new UsersDB();
            return dbs.InsertUser(this, file);
        }


        public int updateUser(int id)
        {
            UsersDB dbs = new UsersDB();
            return dbs.UpdateUserProfile(id,this);
        }

        public User readUser(int userId)
        {
            UsersDB dbs = new UsersDB();
            return dbs.ReadUser(userId);
        }
        public User FindUser()
        {
            UsersDB dbs = new UsersDB();
            return dbs.findUser(this.Email,this.Password);

        }
        public void DeleteById(int userid)
        {
            UsersDB dbs = new UsersDB();
            dbs.DeleteUser(userid);
        }

        public List<dynamic> GetFiles(int? applicationId = null) //both for both case when there is aplicationID and where only userID
        {
            UsersDB db = new UsersDB();
            return db.GetUserFiles(this.UserID, applicationId);
        }

        public bool DeleteUserFile(int fileId)
        {
            UsersDB db = new UsersDB();
            return db.DeleteUserFile(this.UserID, fileId);
        }

        public bool UnlinkFileFromApplication(int applicationId, int fileId)
        {
            UsersDB db = new UsersDB();
            return db.UnlinkFileFromApplication(applicationId, fileId);
        }



        public int ConfirmMentor(int jobSeekerId, int mentorId)
        {
            UsersDB db = new UsersDB();

            return db.ConfirmMentorSelection(jobSeekerId, mentorId); // returns matchId or 0
        }

        public DataTable LoadFeatureMatrix()
        {
            UsersDB db = new UsersDB();
            return db.GetMatchingFeatureData();
        }

        public void ExportFeatureDataToCsv(string filePath)
        {
            DataTable featureData = LoadFeatureMatrix();

            using (StreamWriter writer = new StreamWriter(filePath))
            {
                // כותרות
                IEnumerable<string> columnNames = featureData.Columns.Cast<DataColumn>().Select(col => col.ColumnName);
                writer.WriteLine(string.Join(",", columnNames));

                // שורות
                foreach (DataRow row in featureData.Rows)
                {
                    IEnumerable<string> fields = row.ItemArray.Select(field => field.ToString());
                    writer.WriteLine(string.Join(",", fields));
                }
            }
        }

        public List<Dictionary<string, object>> GetAllUserMatches(int userId, string userType)
        {
            UsersDB db = new UsersDB();
            return db.ReadAllUserMatches(userId, userType);
        }



        public int LinkOrInsertUserFile(UserFile file, int sessionId, bool saveToFilesList)
        {
            UsersDB db = new UsersDB();
            int fileId = file.FileID;

            if (saveToFilesList)
            {
                // נוודא אם הקובץ כבר קיים לפי FileID
                if (fileId == 0 || !db.DoesUserFileExist(file.UserID, file.FileName))
                {
                    fileId = db.AddUserFile(file); // קובץ חדש באמת
                }
                // אחרת – נשתמש בקובץ הקיים (כבר אמור להגיע עם fileId)
            }

            db.LinkFileToSession(sessionId, fileId, file.UserID);
            return fileId;
        }

        //NEW BATEL CHECKING
        public bool RemoveFileFromSession(int sessionId, int fileId)
        {
            UsersDB db = new UsersDB();
            return db.RemoveFileFromSession(sessionId, fileId);
        }

        public List<UserFile> GetSessionFiles(int sessionId)
        {
            UsersDB db = new UsersDB();
            return db.GetSessionFiles(sessionId);
        }
        //


        public int GetLatestVersion()
        {
            UsersDB db = new UsersDB();
            return db.GetLatestVersion();

        }

        public int InsertNewVersion()
        {
            UsersDB db = new UsersDB();
            return db.InsertNewVersion();  // ← כאן להחזיר את מה שהתקבל
        }



 public bool RegisterToOffer(int offerId, int userId)
        {
            SessionDB dbs = new SessionDB();
            return dbs.RegisterUserToOffer(offerId, userId);
        }

        public List<UserRegistrationDTO> GetMyRegistrations(int userId)
        {
            SessionDB dbs = new SessionDB();
            return dbs.GetMyRegistrations(userId);
        }


        public bool UnregisterFromMentorOffer(int offerId)
        {
            SessionDB db = new SessionDB();
            return db.UnregisterFromMentorOffer(this.UserID, offerId);
        }


    }


}
