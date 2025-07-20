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
                    userFile = SaveUserFile(form.File, form.FileType ?? "Resume");
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
        [HttpPost("upload-file")]
        [Consumes("multipart/form-data")]
        public IActionResult UploadFile(
    [FromQuery] int userId,
    [FromForm] IFormFile file,
    [FromQuery] int? applicationId = null,
    [FromQuery] int? sessionId = null,
    [FromQuery] bool saveToFileList = true
)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                var userFile = SaveUserFile(file, "Resume");
                userFile.UserID = userId;

                int fileId;

                if (sessionId.HasValue)
                {
                    // ✅ נשתמש במה שכבר מימשנו
                    User user = new User();
                    fileId = user.LinkOrInsertUserFile(userFile, sessionId.Value, saveToFileList);
                }
                else
                {
                    // שימוש רגיל
                    UsersDB db = new UsersDB();
                    fileId = db.AddUserFile(userFile, applicationId);
                }

                return Ok(new { fileId, message = "File uploaded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}\n\n{ex.StackTrace}");
            }
        }

        [HttpPost("UploadSessionFile")]
        public IActionResult UploadSessionFile([FromBody] UserFile file, int sessionId, bool saveToFileList)
        {
            try
            {
                UsersDB db = new UsersDB();

                // ✅ If only fileID is provided, fetch full file data
                if (file.FileID > 0 && (file.FilePath == null || file.FileName == null))
                {
                    file = db.GetFileById(file.FileID); // ✅ Use your existing method
                    if (file == null)
                        return BadRequest(new { error = "File not found." });
                }

                User user = new User();
                int fileId = user.LinkOrInsertUserFile(file, sessionId, saveToFileList);

                return Ok(new { FileID = fileId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        ///files for mobile
        ///
      

        //


        ///NEW BATEL CHECKING 
        [HttpGet("GetSessionFiles")]
        public IActionResult GetSessionFiles(int sessionId)
        {
            try
            {
                User user = new User();
                var files = user.GetSessionFiles(sessionId);
                return Ok(new { files = files });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpDelete("DeleteSessionFile")]
        public IActionResult DeleteSessionFile(int sessionId, int fileId)
        {
            try
            {
                User user = new User();
                bool success = user.RemoveFileFromSession(sessionId, fileId);

                if (success)
                {
                    return Ok(new { message = "File removed from session successfully" });
                }
                else
                {
                    return BadRequest(new { error = "Failed to remove file from session" });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }
        ///
        /*[ApiExplorerSettings(IgnoreApi = true)]
        private UserFile SaveUserFile(IFormFile file, string fileType)
        {
            var tempFolder = Path.Combine("Uploads", "UserFiles");
            Directory.CreateDirectory(tempFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var fullPath = Path.Combine(tempFolder, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return new UserFile
            {
                FileName = file.FileName,
                FilePath = fullPath.Replace("\\", "/"),
                FileType = fileType,
                UploadedAt = DateTime.Now,
                IsDefault = true
            };
        }*/

        private UserFile SaveUserFile(IFormFile file, string fileType)
        {
            var wwwRootPath = Path.Combine(_env.WebRootPath, "Uploads", "UserFiles");
            Directory.CreateDirectory(wwwRootPath);

            // Simple fix: just use GUID + original extension
            string extension = Path.GetExtension(file.FileName);
            string uniqueFileName = $"{Guid.NewGuid()}{extension}";

            var fullPath = Path.Combine(wwwRootPath, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            var relativeUrlPath = $"/Uploads/UserFiles/{uniqueFileName}";

            return new UserFile
            {
                FileName = file.FileName, // Keep original for display
                FilePath = relativeUrlPath,
                FileType = fileType,
                UploadedAt = DateTime.Now,
                IsDefault = true
            };
        }


        [HttpGet("get-user-files")]
        public IActionResult GetUserFiles([FromQuery] int userId, [FromQuery] int? applicationId = null)
        {
            try
            {
                var user = new User { UserID = userId };
                var files = user.GetFiles(applicationId);
                return Ok(files);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }


        /*[HttpGet("download-file")]
        public IActionResult DownloadFile([FromQuery] int fileId, [FromQuery] int userId)
        {
            try
            {
                Console.WriteLine($"Download request: fileId={fileId}, userId={userId}");

                UsersDB db = new UsersDB();
                var file = db.GetFileById(fileId);

                if (file == null)
                {
                    Console.WriteLine("File not found in DB");
                    return NotFound("File not found in DB.");
                }

                Console.WriteLine($"File found: {file.FileName}, UserID={file.UserID}, Path={file.FilePath}");

                // בדיקת הרשאות פשוטה
                if (file.UserID != userId)
                {
                    Console.WriteLine($"Permission denied: file belongs to user {file.UserID}, not {userId}");
                    return StatusCode(403, "You don't have permission to download this file.");
                }

                var relativePath = file.FilePath.TrimStart('/', '\\');
                var fullPath = Path.Combine(_env.WebRootPath, relativePath);

                Console.WriteLine($"Full path: {fullPath}");

                if (!System.IO.File.Exists(fullPath))
                {
                    Console.WriteLine($"File not found at path: {fullPath}");
                    return NotFound("File not found on disk.");
                }

                var contentType = GetContentType(file.FileName);
                Console.WriteLine($"Serving file with content type: {contentType}");

                return PhysicalFile(fullPath, contentType, file.FileName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in download-file: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }

        private string GetContentType(string fileName)
        {
            var extension = Path.GetExtension(fileName).ToLowerInvariant();
            return extension switch
            {
                ".pdf" => "application/pdf",
                ".doc" => "application/msword",
                ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                _ => "application/octet-stream",
            };
        }*/



        [HttpDelete("delete-user-file")]
        public IActionResult DeleteUserFile([FromQuery] int userId, [FromQuery] int fileId)
        {
            try
            {
                var user = new User { UserID = userId };

                // משיכת פרטי הקובץ לבדיקה
                var file = new UsersDB().GetFileById(fileId);
                if (file == null || file.UserID != user.UserID)
                    return NotFound("File not found or not owned by user.");

                // מחיקה
                bool deleted = user.DeleteUserFile(fileId);
                if (!deleted)
                    return StatusCode(500, "Failed to delete file.");

                // מחיקת קובץ פיזי
                var relativePath = file.FilePath.TrimStart('/', '\\');
                var fullPath = Path.Combine(_env.WebRootPath, relativePath);
                if (System.IO.File.Exists(fullPath))
                    System.IO.File.Delete(fullPath);

                return Ok("File deleted successfully.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Server error: " + ex.Message);
            }
        }

        [HttpDelete("unlink-file-from-application")]
        public IActionResult UnlinkFileFromApplication([FromQuery] int applicationId, [FromQuery] int fileId)
        {
            try
            {
                var user = new User(); // אם אין צורך במשתמש מחובר
                bool success = user.UnlinkFileFromApplication(applicationId, fileId);

                if (!success)
                    return NotFound("File not linked to the application or already removed.");

                return Ok("File successfully unlinked from application.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Server error: " + ex.Message);
            }
        }

        // public int Post([FromBody]User user)
        //  {
        //      return user.insertNewUser();
        //   }
        /// or

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
