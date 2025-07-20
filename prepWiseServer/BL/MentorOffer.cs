using prepWise.DAL;

namespace prepWise.BL
{
    public class MentorOffer
    {
        public int OfferID { get; set; }
        public int MentorUserID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string OfferType { get; set; } = "Group";
        public DateTime DateTime { get; set; }
        public int DurationMinutes { get; set; }
        public int MaxParticipants { get; set; }
        public int CurrentParticipants { get; set; }
        public string Location { get; set; }
        public bool IsOnline { get; set; } = true;
        public string MeetingLink { get; set; }
        public string Status { get; set; } = "Active";
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public List<int> CareerFieldIDs { get; set; } = new List<int>();

        public MentorOffer()
        {
        }

        public MentorOffer(int mentorUserID, string title, string description, string offerType, DateTime dateTime, int durationMinutes, int maxParticipants, bool isOnline, string location, string meetingLink, string additionalInfo, List<int> careerFieldIDs)
        {
            MentorUserID = mentorUserID;
            Title = title;
            Description = description;
            OfferType = string.IsNullOrWhiteSpace(offerType) ? "Group" : offerType;
            DateTime = dateTime;
            DurationMinutes = durationMinutes;
            MaxParticipants = maxParticipants;
            CurrentParticipants = 0;
            IsOnline = isOnline;
            Location = location;
            MeetingLink = meetingLink;
            Status = "Active";
            CreatedAt = DateTime.UtcNow;
            CareerFieldIDs = careerFieldIDs ?? new List<int>();
        }




    }
}