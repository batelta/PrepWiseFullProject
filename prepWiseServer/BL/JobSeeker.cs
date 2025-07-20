using prepWise.DAL;
using System;
using System.Net;
using static System.Net.Mime.MediaTypeNames;
using System.Diagnostics.Eventing.Reader;

namespace prepWise.BL
{
    public class JobSeeker : User
    {
        public string DesiredMentoring { get; set; }
        public int? ApplicationID { get; set; } //we can delete it // 

        // Nullable(can be int or null) because the Jobseeker might not always have a job application assigned yet.
        public JobSeeker()//empty ctor
        {

        }

        public JobSeeker(string desiredMentoring, int? applicationID)
        {
            DesiredMentoring = desiredMentoring;
            ApplicationID = applicationID;
        }

        ApplicationDB dbs = new ApplicationDB();

        public int SubmitApplication(Application newApplication)
        {
            return dbs.InsertApplicationForUser(newApplication, this.UserID);
        }

        public List<Application> GetUserApplications(int userId, bool showArchived)
        {
            return dbs.GetUserApplications(userId, showArchived);
        }
        public void UnarchiveApplicationByUser(int applicationID)
        {
            dbs.UnarchiveApplicationByUser(applicationID, this.UserID);
        }

        public void UpdateStatus(int applicationID, string status)
        {

            dbs.UpdateApplicationStatus(applicationID, this.UserID, status);
        }

        public Application GetByApplicationId(int userId, int applicationId)
        {
            return dbs.GetByApplicationId(userId, applicationId);
        }

        public List<Application> DeleteById(int applicationID, int userID)
        {
            return dbs.DeleteApplicationByUser(applicationID, userID);
        }

        public bool UpdateApplication(Application updatedApplication)
        {
            return dbs.UpdateApplicationByUser(updatedApplication, this.UserID);
        }

        public int AddContactToApplication(Contact newContact, int applicationID)
        {
            return dbs.addContactToApplication(newContact, this.UserID, applicationID);
        }

        public List<Contact> RemoveContactFromApplication(int applicationID, int contactID)
        {
            return dbs.RemoveContactFromApplication(this.UserID, applicationID, contactID);
        }

        public List<Contact> GetContactsByApplication(int applicationID)
        {
            return dbs.GetContactsByApplication(this.UserID, applicationID);
        }



        public Contact UpdateContactAndGetOne(Contact contact, int applicationID)
        {
            bool updated = dbs.UpdateContact(contact, this.UserID, applicationID);

            if (!updated)
                return null; // אם לא התעדכן, לא מחזירים דבר

            return dbs.GetContactsByApplication(this.UserID, applicationID)
                      .FirstOrDefault(c => c.ContactID == contact.ContactID); // מחזירים רק את האיש קשר המעודכן
        }

        public List<Mentor> FindBestMentor(int userID, string gender, bool mentorRole, List<string> mentorCompanies, string guidanceType,
      List<string> mentorLanguages, bool languageImportant, bool genderImportant, bool companyImportant)
        {
            UsersDB db = new UsersDB();

            // Load traits from DB
            var userTraits = db.GetTraitsByUserId(userID);

            return db.FindBestMentor(userID, gender, mentorRole, mentorCompanies,guidanceType, userTraits,
                mentorLanguages,languageImportant, genderImportant, companyImportant);
        }

    }
}