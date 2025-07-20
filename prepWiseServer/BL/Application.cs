using prepWise.DAL;

namespace prepWise.BL
{
    public class Application
    {
       
        public int ApplicationID { get; set; }
        public string CompanyName { get; set; }
        public string Title { get; set; }
        public string Location { get; set; }
        public string URL { get; set; }
        public string CompanySummary { get; set; }
        public string JobDescription { get; set; }
        public string Notes { get; set; }
        public string JobType { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsHybrid { get; set; }
        public bool IsRemote { get; set; }
        public bool IsActive { get; set; }
        public bool IsArchived { get; set; }
        public string ApplicationStatus { get; set; }

        public List<Contact> Contacts { get; set; } = new List<Contact>();
        public Application(int applicationID, string companyName, string title, string location, string url,
                               string companySummary, string jobDescription, string notes,
                               string jobType, DateTime createdAt, bool isHybrid, bool isRemote, bool isActive, bool isArchived, string applicationStatus,
                               List<Contact> contacts = null)
        {
            ApplicationID = applicationID;
            CompanyName = companyName;
            Title = title;
            Location = location;
            URL = url;
            CompanySummary = companySummary;
            JobDescription = jobDescription;
            Notes = notes;
            JobType = jobType;
            CreatedAt = createdAt;
            IsHybrid = isHybrid;
            IsRemote = isRemote;
            IsActive = isActive;
            IsArchived = isArchived;
            ApplicationStatus = applicationStatus;
            Contacts = contacts ?? new List<Contact>();

        }

        public Application()
        {
            CreatedAt = DateTime.Now; // ברירת מחדל - התאריך הנוכחי
        }

        public List<Application> ApplicationList = new List<Application>(); //creating Application list
        ApplicationDB dbs = new ApplicationDB();



        public static Application FromGeminiResult(GeminiResult result, string url)
        {
            return new Application
            {
                Title = result.JobTitle,
                JobDescription = result.JobDescription,
                CompanyName = result.CompanyName,
                CompanySummary = result.CompanySummary,
                URL = url,
                CreatedAt = DateTime.Now,
                IsActive = true,
                IsArchived = false,
                IsHybrid = false,
                IsRemote = false,
                JobType = "",
                Location = "",
                Notes = "",
                ApplicationStatus = "",
            };
        }

        public List<Application> ReadAllApplications()
        {
            return dbs.ReadAllApplications();
        }


    }
}

