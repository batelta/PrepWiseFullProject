using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using prepWise.BL;
using prepWise.DAL;
using System;
using System.IO;
using System.Threading.Tasks;

namespace prepWise.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {

        /*[ApiExplorerSettings(IgnoreApi = true)]


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

        private UserFile SaveUserFile(IFormFile file, string fileType)
        {
            var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "UserFiles");
            Directory.CreateDirectory(uploadFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var fullPath = Path.Combine(uploadFolder, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            // יצירת נתיב נגיש דרך HTTP (ולא קובץ פיזי מקומי בלבד)
            var relativeUrlPath = $"/Images/UserFiles/{uniqueFileName}";

            return new UserFile
            {
                FileName = file.FileName,
                FilePath = relativeUrlPath, // כך תוכל להציג את הקובץ דרך דפדפן
                FileType = fileType,
                UploadedAt = DateTime.Now,
                IsDefault = true
            };
        }*/
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

            if (userId <= 0)
                return BadRequest("Invalid user ID.");

            try
            {
                //  שמירת הקובץ בפועל
                var userFile = UserFile.Save(file, "Resume");
                Console.WriteLine($" File saved at: {userFile.FilePath}");

                userFile.UserID = userId;

                int fileId = -1;

                if (sessionId.HasValue)
                {
                    Console.WriteLine($" Linking file to session {sessionId.Value} for user {userId}");
                    User user = new User();
                    fileId = user.LinkOrInsertUserFile(userFile, sessionId.Value, saveToFileList);
                }
                else
                {
                    Console.WriteLine($" Linking file to application {applicationId} for user {userId}");
                    UsersDB db = new UsersDB();
                    fileId = db.AddUserFile(userFile, applicationId);
                }

                if (fileId <= 0)
                {
                    Console.WriteLine(" File saved, but linking failed.");
                    return StatusCode(500, "File saved but failed to link to user/session/application.");
                }

                return Ok(new { fileId, message = "File uploaded successfully." });
            }
            catch (Exception ex)
            {
                Console.WriteLine(" Exception in UploadFile:");
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.StackTrace);
                return StatusCode(500, $"Error: {ex.Message}");
            }
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
                var relativePath = file.FilePath.Replace("/Images/", "");
                var fullPath = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", relativePath);
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


        /*  [HttpPost("UploadSessionFile")]
          public IActionResult UploadSessionFile([FromBody] UserFile file, int sessionId, bool saveToFileList)
          {
              try
              {
                  User user = new User();
                  int fileId = user.LinkOrInsertUserFile(file, sessionId, saveToFileList);
                  return Ok(new { FileID = fileId });
              }
              catch (Exception ex)
              {
                  return BadRequest(new { error = ex.Message });
              }
          }*/
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

    }

}