namespace prepWise.BL
{
    public class UserRegistrationDTO
    {
        public int OfferID { get; set; }
        public string OfferTitle { get; set; }
        public DateTime OfferDateTime { get; set; }
        public string MentorName { get; set; }
        public string MeetingLink { get; set; }
        public int CurrentParticipants { get; set; }
        public int MaxParticipants { get; set; }
        public bool IsOnline { get; set; }
        public string Location { get; set; }
        public List<int> CareerFieldIDs { get; set; }
    }
}