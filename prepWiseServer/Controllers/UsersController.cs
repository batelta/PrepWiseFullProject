using Microsoft.AspNetCore.Mvc;
using prepWise.BL;
using prepWise.DAL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace prepWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UsersController(IWebHostEnvironment env)
        {
            _env = env;
        }

        // POST api/<UsersController>
        //insert new user
        [HttpPost]
        [Consumes("multipart/form-data")]
        public IActionResult insertNewUser([FromForm] RegisterUserForm form)
        {
            try
            {
                User newUser = form.IsMentor
                    ? new Mentor
                    {
                        FirstName = form.FirstName,
                        LastName = form.LastName,
                        Email = form.Email,
                        Password = form.Password,
                        IsMentor = true,
                        Picture = form.Picture,
                        CareerField = form.CareerField?.Split(',').ToList() ?? new List<string>(),
                        Roles = form.Roles?.Split(',').ToList() ?? new List<string>(),
                        Company = form.Company?.Split(',').ToList() ?? new List<string>(),
                        Experience = form.Experience,
                        Language = form.Language?.Split(',').ToList() ?? new List<string>(),
                        FacebookLink = form.FacebookLink,
                        LinkedInLink = form.LinkedInLink,
                        MentoringType = form.MentoringType,
                        IsHr=form.IsHr,
                        Gender=form.Gender
                    }
                    : new User
                    {
                        FirstName = form.FirstName,
                        LastName = form.LastName,
                        Email = form.Email,
                        Password = form.Password,
                        IsMentor = false,
                        Picture = form.Picture,
                        CareerField = form.CareerField?.Split(',').ToList() ?? new List<string>(),
                        Roles = form.Roles?.Split(',').ToList() ?? new List<string>(),
                        Company = form.Company?.Split(',').ToList() ?? new List<string>(),
                        Experience = form.Experience,
                        Language = form.Language?.Split(',').ToList() ?? new List<string>(),
                        FacebookLink = form.FacebookLink,
                        LinkedInLink = form.LinkedInLink,
                    };

                UserFile? userFile = null;

                if (!form.IsMentor && form.File != null && form.File.Length > 0)
                {
                    // userFile = SaveUserFile(form.File, form.FileType ?? "Resume");
                    userFile = UserFile.Save(form.File, form.FileType ?? "Resume");

                }
                else
                {
                    userFile = null;
                }


                int userId = newUser.insertNewUser(userFile);


                if (userId <= 0)
                    return Conflict("User already exists.");

                return Ok(new { userId, message = "User registered successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}\n\n{ex.StackTrace}");
            }
        }

        [ApiExplorerSettings(IgnoreApi = true)]
     //   [HttpPost("upload-file")]
      //  [Consumes("multipart/form-data")]
 

        //GET: api/<UsersController>
        [HttpGet]
        public User Get(int userId)
        {
            User user = new User();
            return user.readUser(userId);
        }

        // PUT api/<UsersController>/5
        [HttpPut("{id}")]
        public int Put(int id, [FromBody] User updatedUser)
        {
            return updatedUser.updateUser(id);
        }


        ///to login to specific user using mail and password
        ///
        [HttpPost("SearchUser")]
        public User SearchUser([FromBody] User user)
        {
            return user.FindUser(); // This will return the UsersList
        }

        /// or

        // DELETE api/<UsersController>/5
        [HttpDelete("Deletebyid")]
        public void Delete(int userid)
        {
            User user = new User();
            user.DeleteById(userid);
        }

        [HttpPost("traits")]
        public IActionResult PostUserTraits([FromBody] UserTraits traits)
        {
            try
            {
                int result = traits.Insert();
                if (result > 0)
                    return Ok(new { message = "User traits saved successfully" });

                return BadRequest("Failed to save traits");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/Traits")]
        public IActionResult GetUserTraits(int id)
        {
            try
            {
                UserTraits u = new UserTraits();
                var traits = u.GetTraitsByUserId(id);
                if (traits != null)
                {
                    return Ok(traits); // Traits found
                }
                return NotFound("Traits not found for this user");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }


        [HttpGet("all")]
        public IActionResult GetAllUsers()
        {
            try
            {
                User user = new User();
                var users = user.GetAllUsers();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

      

      

        public class ConfirmMatchRequest
        {
            public int JobSeekerID { get; set; }
            public int MentorID { get; set; }
        }
        [HttpPost("confirm")]
        public IActionResult ConfirmMentorSelection([FromBody] ConfirmMatchRequest request)
        {
            try
            {
                User user = new User();
                int matchId = user.ConfirmMentor(request.JobSeekerID, request.MentorID);

                if (matchId > 0)
                    return Ok(new { message = "Match confirmed successfully. matchId=",  matchId });
                else
                    return NotFound(new { message = "No matching record found to update." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }





        [HttpGet]
        [Route("MentorOffer/MyRegistrations")]
        public IActionResult GetMyRegistrations([FromQuery] int userId)
        {
            try
            {
                User user = new User();
                List<UserRegistrationDTO> regs = user.GetMyRegistrations(userId);

                return Ok(regs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("RegisterToOffer")]
        public IActionResult RegisterToOffer([FromBody] MentorOfferRegistration registration)
        {
            try
            {
                Console.WriteLine($"DEBUG => OfferID: {registration.OfferID}, UserID: {registration.UserID}");

                User user = new User();
                bool success = user.RegisterToOffer(registration.OfferID, registration.UserID);

                if (success)
                {
                    return Ok(new { Success = true });
                }
                else
                {
                    // במקום BadRequest → OK עם Success false
                    return Ok(new { Success = false, Message = "Already registered or full." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpDelete("{userId}/mentorOffers/{offerId}/unregister")]
        public IActionResult UnregisterFromMentorOffer(int userId, int offerId)
        {
            try
            {
                User u = new User { UserID = userId };
                bool success = u.UnregisterFromMentorOffer(offerId);

                if (success)
                    return Ok("Unregistered successfully");
                else
                    return Ok("User was not registered for this offer.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Server error: " + ex.Message);
            }
        }

    }
}
