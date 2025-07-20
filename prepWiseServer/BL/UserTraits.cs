using prepWise.DAL;

namespace prepWise.BL
{
    public enum SocialStyle { Introvert, Extrovert }
    public enum GuidanceStyle { Structured, Flexible }
    public enum CommunicationStyle { Calm, Energetic }
    public enum LearningStyle { StepByStep, BigPicture }
    public enum JobExperienceLevel { Beginner, Intermediate, Experienced }

    public class UserTraits
    {
        public int UserID { get; set; }
        public SocialStyle SocialStyle { get; set; }
        public GuidanceStyle GuidanceStyle { get; set; }
        public CommunicationStyle CommunicationStyle { get; set; }
        public LearningStyle LearningStyle { get; set; }
        public JobExperienceLevel JobExperienceLevel { get; set; }

        public int Insert()
        {
            UsersDB dbs = new UsersDB();
            return dbs.InsertUserTraits(this);
        }
        public UserTraits GetTraitsByUserId(int userId)
        {
            UsersDB dbs = new UsersDB();
            return dbs.GetTraitsByUserId(userId);
        }
    }
}