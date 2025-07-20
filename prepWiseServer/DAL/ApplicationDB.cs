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
public class ApplicationDB
{

    public ApplicationDB()
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

    /* public int insertApplication(Application newApplication)
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


         ///i want to check first in the applications list , if this application exists
         Dictionary<string, object> paramDic = new Dictionary<string, object>();
         paramDic.Add("@CompanyName", newApplication.CompanyName);       // Corresponds to FirstName in the table
         paramDic.Add("@Title", newApplication.Title);         // Corresponds to LastName in the table
         paramDic.Add("@Location", newApplication.Location);              
         paramDic.Add("@URL", newApplication.URL);         
         paramDic.Add("@CompanySummary", newApplication.CompanySummary);           
         paramDic.Add("@JobDescription", newApplication.JobDescription);
         paramDic.Add("@Notes", newApplication.Notes);
         paramDic.Add("@JobType", newApplication.JobType); 
         paramDic.Add("@CreatedAt", newApplication.CreatedAt);
         paramDic.Add("@IsHybrid", newApplication.IsHybrid); 
         paramDic.Add("@IsRemote", newApplication.IsRemote); 






         cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertNewApplication", con, paramDic);        // create the command

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
         return sumOfNumEff;
     }*/

    public List<Contact> GetContactsByApplication(int userID, int applicationID)
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

        List<Contact> contacts = new List<Contact>();

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserID", userID);
        paramDic.Add("@ApplicationID", applicationID);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetContactsByApplication", con, paramDic);

        try
        {
            SqlDataReader reader = cmd.ExecuteReader();

            while (reader.Read())
            {
                Contact c = new Contact
                {
                    ContactID = Convert.ToInt32(reader["ContactID"]),
                    ContactName = reader["ContactName"]?.ToString(),
                    ContactEmail = reader["ContactEmail"]?.ToString(),
                    ContactPhone = reader["ContactPhone"]?.ToString(),
                    ContactNotes = reader["ContactNotes"]?.ToString()
                };

                contacts.Add(c);
            }

            return contacts;
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

    public int addContactToApplication(Contact newContact, int userID, int applicationID)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // יצירת החיבור
        }
        catch (Exception ex)
        {
            throw ex;
        }

        int newContactID = -1;

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserID", userID);
        paramDic.Add("@ApplicationID", applicationID);
        paramDic.Add("@ContactName", newContact.ContactName ?? (object)DBNull.Value);
        paramDic.Add("@ContactEmail", newContact.ContactEmail ?? (object)DBNull.Value);
        paramDic.Add("@ContactPhone", newContact.ContactPhone ?? (object)DBNull.Value);
        paramDic.Add("@ContactNotes", newContact.ContactNotes ?? (object)DBNull.Value);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_AddContactToApplication", con, paramDic);

        try
        {
            object result = cmd.ExecuteScalar();
            if (result != null)
            {
                newContactID = Convert.ToInt32(result);
            }
        }
        catch (Exception ex)
        {
            if (con != null)
            {
                con.Close();
            }
            throw ex;
        }

        if (con != null)
        {
            con.Close();
        }

        return newContactID;
    }

    /*public bool UpdateContact(Contact contact, int userID, int applicationID)
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
        paramDic.Add("@UserID", userID);
        paramDic.Add("@ApplicationID", applicationID);
        paramDic.Add("@ContactID", contact.ContactID);

        // כאן אני מוסיף את הבדיקה גם למחרוזות ריקות וגם ל-"string"
        paramDic.Add("@ContactName", string.IsNullOrEmpty(contact.ContactName) || contact.ContactName == "string" ? (object)DBNull.Value : contact.ContactName);
        paramDic.Add("@ContactEmail", string.IsNullOrEmpty(contact.ContactEmail) || contact.ContactEmail == "string" ? (object)DBNull.Value : contact.ContactEmail);
        paramDic.Add("@ContactPhone", string.IsNullOrEmpty(contact.ContactPhone) || contact.ContactPhone == "string" ? (object)DBNull.Value : contact.ContactPhone);
        paramDic.Add("@ContactNotes", string.IsNullOrEmpty(contact.ContactNotes) || contact.ContactNotes == "string" ? (object)DBNull.Value : contact.ContactNotes);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateContact", con, paramDic);

        try
        {
            cmd.ExecuteNonQuery();
            return true;
        }
        catch (Exception ex)
        {
            throw ex;
        }
        finally
        {
            if (con != null) con.Close();
        }
    }*/

    public bool UpdateContact(Contact contact, int userID, int applicationID)
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
        paramDic.Add("@UserID", userID);
        paramDic.Add("@ApplicationID", applicationID);
        paramDic.Add("@ContactID", contact.ContactID);

        // בדיקה אם הערכים לא ריקים או שווים ל-"string", ואז נעדכן אותם
        paramDic.Add("@ContactName", string.IsNullOrEmpty(contact.ContactName) || contact.ContactName == "string" ? (object)DBNull.Value : contact.ContactName);
        paramDic.Add("@ContactEmail", string.IsNullOrEmpty(contact.ContactEmail) || contact.ContactEmail == "string" ? (object)DBNull.Value : contact.ContactEmail);
        paramDic.Add("@ContactPhone", string.IsNullOrEmpty(contact.ContactPhone) || contact.ContactPhone == "string" ? (object)DBNull.Value : contact.ContactPhone);
        paramDic.Add("@ContactNotes", string.IsNullOrEmpty(contact.ContactNotes) || contact.ContactNotes == "string" ? (object)DBNull.Value : contact.ContactNotes);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateContact", con, paramDic);

        try
        {
            cmd.ExecuteNonQuery();
            return true;
        }
        catch (Exception ex)
        {
            throw ex;
        }
        finally
        {
            if (con != null) con.Close();
        }
    }

    public List<Application> ReadAllApplications()
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

        List<Application> applications = new List<Application>();

        cmd = CreateCommandWithStoredProcedureGeneral("SP_ReadAllApplications", con, null);

        try
        {

            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Application a = new Application();

                a.ApplicationID = Convert.ToInt32(dataReader["ApplicationID"]);
                a.CompanyName = dataReader["CompanyName"] != DBNull.Value ? dataReader["CompanyName"].ToString() : string.Empty;
                a.Title = dataReader["Title"] != DBNull.Value ? dataReader["Title"].ToString() : string.Empty;
                a.Location = dataReader["Location"] != DBNull.Value ? dataReader["Location"].ToString() : string.Empty;
                a.URL = dataReader["URL"] != DBNull.Value ? dataReader["URL"].ToString() : string.Empty;
                a.CompanySummary = dataReader["CompanySummary"] != DBNull.Value ? dataReader["CompanySummary"].ToString() : string.Empty;
                a.JobDescription = dataReader["JobDescription"] != DBNull.Value ? dataReader["JobDescription"].ToString() : string.Empty;
                a.Notes = dataReader["Notes"] != DBNull.Value ? dataReader["Notes"].ToString() : string.Empty;
                a.JobType = dataReader["JobType"] != DBNull.Value ? dataReader["JobType"].ToString() : string.Empty;
                a.CreatedAt = dataReader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(dataReader["CreatedAt"]) : DateTime.MinValue;
                a.IsHybrid = dataReader["IsHybrid"] != DBNull.Value ? Convert.ToBoolean(dataReader["IsHybrid"]) : false;
                a.IsRemote = dataReader["IsRemote"] != DBNull.Value ? Convert.ToBoolean(dataReader["IsRemote"]) : false;
                a.IsActive = dataReader["IsActive"] != DBNull.Value ? Convert.ToBoolean(dataReader["IsActive"]) : false;
                a.IsArchived = dataReader["IsArchived"] != DBNull.Value ? Convert.ToBoolean(dataReader["IsArchived"]) : false;
                a.ApplicationStatus = dataReader["ApplicationStatus"] != DBNull.Value ? dataReader["ApplicationStatus"].ToString() : string.Empty;

                applications.Add(a);
            }
            return applications;
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




    public int InsertApplicationForUser(Application newApplication, int userID)
    {
        SqlConnection con;
        SqlCommand cmd;

        try
        {
            con = connect("myProjDB"); // יצירת חיבור למסד הנתונים
        }
        catch (Exception ex)
        {
            throw ex;
        }

        int applicationId = 0; // משתנה לקבלת ה-ID החדש של הבקשה

        // הכנסת הבקשה לטבלת Application
        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserID", userID);  // נוסיף את ה-UserID
        paramDic.Add("@CompanyName", newApplication.CompanyName);
        paramDic.Add("@Title", newApplication.Title);
        paramDic.Add("@Location", newApplication.Location);
        paramDic.Add("@URL", newApplication.URL);
        paramDic.Add("@CompanySummary", newApplication.CompanySummary);
        paramDic.Add("@JobDescription", newApplication.JobDescription);
        paramDic.Add("@Notes", newApplication.Notes);
        paramDic.Add("@JobType", newApplication.JobType);
        paramDic.Add("@CreatedAt", newApplication.CreatedAt);
        paramDic.Add("@IsHybrid", newApplication.IsHybrid);
        paramDic.Add("@IsRemote", newApplication.IsRemote);
        paramDic.Add("@ApplicationStatus", newApplication.ApplicationStatus);



        Contact addNewContact = newApplication.Contacts.FirstOrDefault();

        if (addNewContact != null)
        {
            paramDic.Add("@ContactName", addNewContact.ContactName ?? (object)DBNull.Value);
            paramDic.Add("@ContactEmail", addNewContact.ContactEmail ?? (object)DBNull.Value);
            paramDic.Add("@ContactPhone", addNewContact.ContactPhone ?? (object)DBNull.Value);
            paramDic.Add("@ContactNotes", addNewContact.ContactNotes ?? (object)DBNull.Value);
        }
        else
        {
            paramDic.Add("@ContactName", DBNull.Value);
            paramDic.Add("@ContactEmail", DBNull.Value);
            paramDic.Add("@ContactPhone", DBNull.Value);
            paramDic.Add("@ContactNotes", DBNull.Value);
        }


        cmd = CreateCommandWithStoredProcedureGeneral("SP_InsertNewApplication", con, paramDic);

        try
        {
            object result = cmd.ExecuteScalar();
            if (result != null && int.TryParse(result.ToString(), out int id))
            {
                applicationId = id;
            }
        }
        catch (Exception ex)
        {
            if (con != null)
            {
                con.Close();
            }
            throw ex;
        }

        if (con != null)
        {
            con.Close();
        }
        return applicationId;

    }



    public List<Contact> RemoveContactFromApplication(int userID, int applicationID, int contactID)
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
        paramDic.Add("@UserID", userID);
        paramDic.Add("@ApplicationID", applicationID);
        paramDic.Add("@ContactID", contactID);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_RemoveContactFromApplication", con, paramDic);

        try
        {
            cmd.ExecuteNonQuery();
        }
        catch (Exception ex)
        {
            if (con != null) con.Close();
            throw ex;
        }

        // קריאה חוזרת של אנשי הקשר המעודכנים
        return GetContactsByApplication(userID, applicationID);
    }


    //read all user Appliactioms
    public List<Application> GetUserApplications(int userID, bool showArchived)
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

        List<Application> Applications = new List<Application>();
        Dictionary<int, Application> appDict = new Dictionary<int, Application>();

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserId", userID);
        paramDic.Add("@ShowArchived", showArchived);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetUserApplicationsById", con, paramDic);

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                int appId = Convert.ToInt32(dataReader["ApplicationID"]);

                // אם הבקשה עדיין לא קיימת - ניצור ונוסיף
                if (!appDict.ContainsKey(appId))
                {
                    Application a = new Application
                    {
                        ApplicationID = appId,
                        CompanyName = dataReader["CompanyName"]?.ToString(),
                        Title = dataReader["Title"]?.ToString(),
                        Location = dataReader["Location"]?.ToString(),
                        URL = dataReader["URL"]?.ToString(),
                        CompanySummary = dataReader["CompanySummary"]?.ToString(),
                        JobDescription = dataReader["JobDescription"]?.ToString(),
                        Notes = dataReader["Notes"]?.ToString(),
                        JobType = dataReader["JobType"] != DBNull.Value ? dataReader["JobType"].ToString() : string.Empty,
                        CreatedAt = dataReader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(dataReader["CreatedAt"]) : DateTime.MinValue,
                        IsHybrid = dataReader["IsHybrid"] != DBNull.Value && Convert.ToBoolean(dataReader["IsHybrid"]),
                        IsRemote = dataReader["IsRemote"] != DBNull.Value && Convert.ToBoolean(dataReader["IsRemote"]),
                        ApplicationStatus = dataReader["ApplicationStatus"] != DBNull.Value ? dataReader["ApplicationStatus"].ToString() : null,
                        IsArchived = dataReader["IsArchived"] != DBNull.Value && Convert.ToBoolean(dataReader["IsArchived"]), // 👈 הוסף שורה זו


                        Contacts = new List<Contact>()
                    };

                    Applications.Add(a);
                    appDict.Add(appId, a);
                }

                // אם יש איש קשר - נוסיף אותו לבקשה הקיימת
                if (dataReader["ContactID"] != DBNull.Value)
                {
                    Contact c = new Contact
                    {
                        ContactID = Convert.ToInt32(dataReader["ContactID"]),
                        ContactName = dataReader["ContactName"]?.ToString(),
                        ContactEmail = dataReader["ContactEmail"]?.ToString(),
                        ContactPhone = dataReader["ContactPhone"]?.ToString(),
                        ContactNotes = dataReader["ContactNotes"]?.ToString()
                    };

                    appDict[appId].Contacts.Add(c);
                }
            }

            return Applications;
        }
        catch (Exception ex)
        {
            throw ex;
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
    }

    public void UpdateApplicationStatus(int applicationID, int userID, string status)
    {
        SqlConnection con = connect("myProjDB");
        SqlCommand cmd;

        Dictionary<string, object> paramDic = new Dictionary<string, object>
    {
        { "@ApplicationID", applicationID },
        { "@UserID", userID },
        { "@ApplicationStatus", status }
    };

        cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateApplicationStatus", con, paramDic);

        try
        {
            cmd.ExecuteNonQuery();
        }
        finally
        {
            if (con != null)
                con.Close();
        }
    }

    public Application GetByApplicationId(int userID, int applicationId)
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

        Application application = null;

        Dictionary<string, object> paramDic = new Dictionary<string, object>();
        paramDic.Add("@UserID", userID); // תיקון קטן במפתח - שיהיה תואם לשם בפרוצדורה
        paramDic.Add("@ApplicationID", applicationId);

        cmd = CreateCommandWithStoredProcedureGeneral("SP_GetByApplicationId", con, paramDic);

        try
        {
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                if (application == null)
                {
                    application = new Application
                    {
                        ApplicationID = applicationId,
                        CompanyName = dataReader["CompanyName"]?.ToString(),
                        Title = dataReader["Title"]?.ToString(),
                        Location = dataReader["Location"]?.ToString(),
                        URL = dataReader["URL"]?.ToString(),
                        CompanySummary = dataReader["CompanySummary"]?.ToString(),
                        JobDescription = dataReader["JobDescription"]?.ToString(),
                        Notes = dataReader["Notes"]?.ToString(),
                        JobType = dataReader["JobType"]?.ToString(),
                        CreatedAt = dataReader["CreatedAt"] != DBNull.Value ? Convert.ToDateTime(dataReader["CreatedAt"]) : DateTime.MinValue,
                        IsHybrid = dataReader["IsHybrid"] != DBNull.Value && Convert.ToBoolean(dataReader["IsHybrid"]),
                        IsRemote = dataReader["IsRemote"] != DBNull.Value && Convert.ToBoolean(dataReader["IsRemote"]),
                        IsActive = dataReader["IsActive"] != DBNull.Value && Convert.ToBoolean(dataReader["IsActive"]),
                        IsArchived = dataReader["IsArchived"] != DBNull.Value && Convert.ToBoolean(dataReader["IsArchived"]),
                        ApplicationStatus = dataReader["ApplicationStatus"]?.ToString(),

                        Contacts = new List<Contact>()
                    };
                }

                // הוספת איש קשר אם קיים
                if (dataReader["ContactID"] != DBNull.Value)
                {
                    Contact contact = new Contact
                    {
                        ContactID = Convert.ToInt32(dataReader["ContactID"]),
                        ContactName = dataReader["ContactName"]?.ToString(),
                        ContactEmail = dataReader["ContactEmail"]?.ToString(),
                        ContactPhone = dataReader["ContactPhone"]?.ToString(),
                        ContactNotes = dataReader["ContactNotes"]?.ToString()
                    };

                    application.Contacts.Add(contact);
                }
            }

            return application;
        }
        catch (Exception ex)
        {
            throw ex;
        }
        finally
        {
            if (con != null)
            {
                con.Close();
            }
        }
    }

    public List<Application> DeleteApplicationByUser(int applicationID, int userID)
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
        paramDic.Add("@ApplicationID", applicationID);
        paramDic.Add("@UserID", userID);


        cmd = CreateCommandWithStoredProcedureGeneral("SP_DeleteApplicationByUser", con, paramDic);

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

        List<Application> applicaions = new List<Application>();
        //applicaions = GetUserApplications(userID);
        applicaions = GetUserApplications(userID, false);
        return applicaions;

    }
    public void UnarchiveApplicationByUser(int applicationID, int userID)
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

        Dictionary<string, object> paramDic = new Dictionary<string, object>
    {
        { "@ApplicationID", applicationID },
        { "@UserID", userID }
    };

        cmd = CreateCommandWithStoredProcedureGeneral("SP_UnarchiveApplicationByUser", con, paramDic);

        try
        {
            cmd.ExecuteNonQuery();
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


    public bool UpdateApplicationByUser(Application updatedApplication, int userID)
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
        paramDic.Add("@ApplicationID", updatedApplication.ApplicationID);  // ApplicationID נשאר כפי שהוא
        paramDic.Add("@UserID", userID);  // קבל את ה-UserID מהשרת ולא מהלקוח
        paramDic.Add("@CompanyName", updatedApplication.CompanyName);
        paramDic.Add("@Title", updatedApplication.Title);
        paramDic.Add("@Location", updatedApplication.Location);
        paramDic.Add("@URL", updatedApplication.URL);
        paramDic.Add("@CompanySummary", updatedApplication.CompanySummary);
        paramDic.Add("@JobDescription", updatedApplication.JobDescription);
        paramDic.Add("@Notes", updatedApplication.Notes);
        paramDic.Add("@JobType", updatedApplication.JobType);
        paramDic.Add("@IsHybrid", updatedApplication.IsHybrid);
        paramDic.Add("@IsRemote", updatedApplication.IsRemote);
        paramDic.Add("@ApplicationStatus", updatedApplication.ApplicationStatus);


        cmd = CreateCommandWithStoredProcedureGeneral("SP_UpdateApplicationByUser", con, paramDic);

        try
        {
            object result = cmd.ExecuteScalar();
            return result != null && Convert.ToInt32(result) == 1;
        }
        catch (Exception ex)
        {
            if (con != null) { con.Close(); }
            throw ex;
        }
        finally
        {
            if (con != null) { con.Close(); }
        }
    }
}
