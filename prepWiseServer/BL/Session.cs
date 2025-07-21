using prepWise.DAL;
using static prepWise.DAL.SessionDB;

namespace prepWise.BL
{
    public class Session
    {
        public int SessionID { get; set; }
        //public int MatchID { get; set; }
        public int JourneyID { get; set; }
        public DateTime? ScheduledAt { get; set; }
        public string Status { get; set; }
        public string? Notes { get; set; }
        public string? MeetingUrl { get; set; }
      //  public User JobSeeker { get; set; }
        //empty constractor
        public Session()
        {

        }
        public Session(int sessionId,int journeyId,DateTime scheduledAt,
            string status,string notes,string meetingUrl)
        {

            SessionID = sessionId;
            JourneyID = journeyId;
            ScheduledAt = scheduledAt;
            Status = status;
            Notes = notes;
            MeetingUrl = meetingUrl;
        }
        private SessionDB db = new SessionDB();

        public Session GetSessionForUser(int sessionId)
        {
            return db.GetSessionById(sessionId);
        }

        public int InsertSession(Session session)
        {
            return db.InsertSession(session);
        }

        public void MarkJourneyAsMultipleSessions(int journeyId)
        {
            db.MarkJourneyAsMultipleSessions(journeyId);
        }

        public List<Session> GetSessionsByUsersIDs(int jobseekerID,int mentorID)
        {
            return db.GetSessionsByUsersIDs(jobseekerID, mentorID);
        }
        public List<MentorSessionView> GetPendingSessionsForMentor(int mentorId)
        {
            return db.GetPendingSessionsForMentor(mentorId);
        }
        public bool CheckIfPendingSessionExists(int journeyID)
        {
            return db.CheckIfPendingSessionExists(journeyID);
        }

        public bool ApproveSession(int sessionID)
        {
            return db.UpdateSessionStatus(sessionID, "approved");
        }

        public bool RejectSession(int sessionID)
        {
            return db.UpdateSessionStatus(sessionID, "rejected");
        }

        public bool UpdateSession(Session session)
        {
            return db.UpdateSession(session);
        }


        public Dictionary<string, object> GetSessionFeedback(int sessionId, int userID)
        {
            SessionDB sessionDB = new SessionDB();
            return sessionDB.GetSessionFeedback(sessionId, userID);
        }

        public bool UpsertSessionFeedback(int sessionId, int submittedBy, double rating, string comment)
        {
            SessionDB sessionDB = new SessionDB();
            return sessionDB.UpsertSessionFeedback(sessionId, submittedBy, rating, comment);
        }



        public int AddTaskToSession(int sessionID, string title, string description,int jobSeekerID)
        {
            SessionDB db = new SessionDB();
            return db.InsertTask(sessionID, title, description, jobSeekerID);
        }

        public List<Dictionary<string, object>> GetTasksForSession(int sessionID)
        {
            SessionDB db = new SessionDB();
            return db.GetTasksBySession(sessionID);
        }


        public bool UpsertTaskCompletion(int taskID, int jobSeekerID, bool isCompleted)
        {
            SessionDB db = new SessionDB();
            return db.UpsertTaskCompletion(taskID, jobSeekerID, isCompleted);
        }

        public List<int> GetCompletedTasksForSession(int sessionId, int jobSeekerId)
        {
            SessionDB db = new SessionDB();
            return db.GetCompletedTasksForSession(sessionId, jobSeekerId);
        }


        public Dictionary<string, int> GetTaskProgress(int jobSeekerId)
        {
            SessionDB db = new SessionDB();
            return db.GetTaskProgressForJobSeeker(jobSeekerId);
        }
        public bool DeleteTask(int taskId)
        {
            SessionDB db = new SessionDB();
            return db.DeleteTask(taskId);
        }
        public bool UpdateTask(int taskId, string title, string description)
        {
            SessionDB db = new SessionDB();
            return db.UpdateTask(taskId, title, description);
        }

        public List<MentorSessionView> GetUpcomingSessionsForMentorView(int mentorId)
        {
            SessionDB db = new SessionDB();
            return db.GetUpcomingSessionsForMentorView(mentorId);
        }

        ///ALSO OR
/*
        public List<Session> GetUpcomingSessionsForMentor(int mentorId)
        {
            return db.GetUpcomingSessionsForMentor(mentorId);
        }
*/
        public bool ArchiveSession(int sessionId)
        {
            return db.ArchiveSession(sessionId);
        }
    }
}