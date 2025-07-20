using prepWise.BL;
using System;
using System.Text.Json.Serialization;

namespace prepWise.BL
{
    public class Contact
    {


        public int ContactID { get; set; }
        public string ContactName { get; set; }
        public string ContactEmail { get; set; }
        public string ContactPhone { get; set; }
        public string ContactNotes { get; set; }

        public Contact() { }

        public Contact(int contactID, string contactName, string contactEmail, string contactPhone, string contactNotes)
        {
            ContactID = contactID;
            ContactName = contactName;
            ContactEmail = contactEmail;
            ContactPhone = contactPhone;
            ContactNotes = contactNotes;
        }
    }
}

