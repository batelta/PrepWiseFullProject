using Microsoft.AspNetCore.Mvc;
using prepWise.BL;
using prepWise.DAL;
using System;
using System.Net;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace prepWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobSeekersController : ControllerBase
    {

        private readonly ApplicationDB dbs = new ApplicationDB();
        // GET: api/<JobSeekersController>

     

        // GET api/<JobSeekersController>/5

        [HttpGet("{id}/applications")]
        public IActionResult GetUserApplications(int id, [FromQuery] bool showArchived = false)
        {
            try
            {
                JobSeeker js = new JobSeeker { UserID = id };
                List<Application> applications = js.GetUserApplications(id, showArchived);



                // ❌ לא צריך לבדוק אם ריק – פשוט להחזיר את הרשימה גם אם היא [] 
                return Ok(applications);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }


        [HttpGet("{userID}/applications/{applicationID}")]
        public IActionResult GetApplicationById(int userID, int applicationID)
        {
            try
            {
                JobSeeker js = new JobSeeker { UserID = userID };

                Application application = js.GetByApplicationId(userID, applicationID);

                if (application == null)
                {
                    return NotFound(new { message = $"Application with ID {applicationID} for user {userID} not found." });
                }

                return Ok(application);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }


        // POST api/<JobSeekersController>

        [HttpPost("{userID}/applications")]
        public IActionResult Post(int userID, [FromBody] Application application)
        {
            if (application == null)
            {
                return BadRequest("Application data is required.");
            }

            try
            {
                JobSeeker user = new JobSeeker { UserID = userID };
                // user.SubmitApplication(application); //update for uplode file
                int newAppId = user.SubmitApplication(application);

                //return Ok(new { Message = "Application submitted successfully" });
                return Ok(new { ApplicationID = newAppId, Message = "Application submitted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{userID}/applications/{applicationID}/contacts")]
        public IActionResult AddContactToApplication(int userID, int applicationID, [FromBody] Contact contact)
        {
            if (contact == null)
            {
                return BadRequest("Contact data is required.");
            }

            try
            {
                JobSeeker js = new JobSeeker { UserID = userID };
                int contactId = js.AddContactToApplication(contact, applicationID);
                contact.ContactID = contactId;

                return Ok(new
                {
                    contact.ContactID,
                    contact.ContactName,
                    contact.ContactEmail,
                    contact.ContactPhone,
                    contact.ContactNotes
                });
       
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }



      
        [HttpPut("{userID}/applications/{applicationID}")]
        public IActionResult UpdateApplication(int userID, int applicationID, [FromBody] Application updatedApplication)
        {
            try
            {
                JobSeeker jobSeeker = new JobSeeker { UserID = userID };

                //  מוודאים שהבקשה שמתעדכנת היא זו שמופיעה בנתיב (לא זו שבאה מה-Body)
                updatedApplication.ApplicationID = applicationID;

                bool success = jobSeeker.UpdateApplication(updatedApplication);

                if (!success)
                {
                    return NotFound(new { message = $"Application {applicationID} not found for user {userID} or no changes were made." });
                }

                return Ok(new { message = $"Application {applicationID} updated successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        [HttpPut("{userID}/applications/{applicationID}/contacts/{contactID}")]


        public IActionResult UpdateContact(int userID, int applicationID, int contactID, [FromBody] Contact contact)
        {
            if (contact == null)
            {
                return BadRequest("Contact data is required.");
            }

            contact.ContactID = contactID;

            try
            {
                JobSeeker js = new JobSeeker { UserID = userID };
                var updatedContact = js.UpdateContactAndGetOne(contact, applicationID); // עדכון והחזרת איש הקשר הספציפי

                if (updatedContact == null)
                {
                    return NotFound(new { message = "Contact not found or not updated." });
                }

                return Ok(new
                {
                    message = "Contact updated successfully.",
                    contact = updatedContact // מחזירים רק את האיש קשר שהשתנה
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }


        [HttpPut("updateStatus/{userID}/{applicationID}")]
        public IActionResult UpdateApplicationStatus(int userID, int applicationID, [FromBody] string newStatus)
        {
            try
            {
                JobSeeker js = new JobSeeker { UserID = userID };
                js.UpdateStatus(applicationID, newStatus);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        [HttpPut("unarchiveById/{userID}/{applicationID}")]
        public IActionResult UnarchiveApplication(int userID, int applicationID)
        {
            try
            {
                JobSeeker js = new JobSeeker { UserID = userID };
                js.UnarchiveApplicationByUser(applicationID);
                return Ok(new { message = "Application unarchived successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }

        // DELETE api/<JobSeekersController>/5
        [HttpDelete("deleteById/{userID}/{applicationID}")]
        public List<Application> Delete(int userID, int applicationID)
        {
            JobSeeker jobSeeker = new JobSeeker { UserID = userID };
            return jobSeeker.DeleteById(applicationID, userID);
        }

        [HttpDelete("deleteContact/{userID}/applications/{applicationID}/contacts/{contactID}")]
        public IActionResult DeleteContactFromApplication(int userID, int applicationID, int contactID)
        {
            try
            {
                JobSeeker js = new JobSeeker { UserID = userID };

                List<Contact> updated = js.RemoveContactFromApplication(applicationID, contactID);

                return Ok(new
                {
                    message = "Contact removed successfully.",
                    updatedContacts = updated
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "Internal server error", message = ex.Message });
            }
        }
    }
}