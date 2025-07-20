using prepWise.DAL;

namespace prepWise.BL
{
    public class Mentor :User
    {
        public string MentoringType { get; set; }
        public bool IsHr { get; set; }
        public int? OfferID { get; set; }
        // Nullable(can be int or null) because the mentor might not always have an offer assigned yet.

        public int MatchCount { get; set; } = 0;  // optional
        public string Gender { get; set; }
        public Mentor()//empty ctor
        {
            
        }

        public Mentor(string mentoringType, int? offerID, bool isHr, string gender)
        {
            MentoringType = mentoringType;
            OfferID = offerID;
            IsHr = isHr;
            Gender = gender;
        }

        public int insertNewUser()
        {
            Mentor newUser = new Mentor();
            UsersDB dbs = new UsersDB();
            return dbs.InsertUser(this);
        }
        public int updateUser(int id)
        {
            Mentor updatedUser = new Mentor();
            UsersDB dbs = new UsersDB();
            return dbs.UpdateUserProfile(id,this);
        }   
        public User readUser(int userId)
        {
            UsersDB dbs = new UsersDB();
            return dbs.ReadUser(userId); // this is where the actual object is created
        }



 public int InsertMentorOffer(MentorOffer offer)
        {
            SessionDB dbs = new SessionDB();
            return dbs.InsertMentorOffer(offer);
        }

        // Get כל ההצעות
        public List<MentorOffer> GetMentorOffers()
        {
            SessionDB dbs = new SessionDB();
            return dbs.GetMentorOffers(null);
        }

        // Get של מנטור מסוים
        public List<MentorOffer> GetMentorOffers(int mentorUserId)
        {
            SessionDB dbs = new SessionDB();
            return dbs.GetMentorOffers(mentorUserId);
        }

        public bool UpdateMentorOffer(MentorOffer offer)
        {
            SessionDB dbs = new SessionDB();
            return dbs.UpdateMentorOffer(offer);
        }

        public bool DeleteMentorOffer(int offerId)
        {
            SessionDB dbs = new SessionDB();
            return dbs.DeleteMentorOffer(offerId);
        }

        public List<MentorOffer> GetMentorOffersForUser(int userId) //show to JS only relevant offers by carrers
        {
            SessionDB db = new SessionDB();
            return db.GetMentorOffersForUser(userId);
        }

        public MentorOffer GetMentorOfferById(int offerID)
        {
            SessionDB db = new SessionDB();
            return db.GetMentorOfferById(offerID);
        }


    }
}
