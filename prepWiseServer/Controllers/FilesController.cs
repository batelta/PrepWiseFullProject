using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace prepWise.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
    }
    //private readonly string uploadFolderPath;

    /* public FilesController(IWebHostEnvironment env)
     {
         uploadFolderPath = Path.Combine(env.ContentRootPath, "Uploads");
     }

     [HttpPost("upload")]
     public async Task<IActionResult> Upload([FromForm] FileUploadModel model)
     {
         if (model.File == null || model.File.Length == 0)
         {
             return BadRequest("לא הועלה קובץ.");
         }
          try
                 {
                     // ודא שהדירקטוריה קיימת
                     Directory.CreateDirectory(uploadFolderPath);
         // קבלת שם הקובץ המלא והסיומת
                     var originalFileName = Path.GetFileNameWithoutExtension(model.File.FileName);
                     var fileExtension = Path.GetExtension(model.File.FileName);

            // מחיקת קבצים קיימים עם אותו שם
                     DeleteExistingFiles(originalFileName);

             // יצירת שם קובץ ייחודי עם תאריך ושעה
                     var timeStamp = DateTime.Now.ToString("yyyyMMddHHmmssfff");
                     var fileName = $"{originalFileName}_{timeStamp}{fileExtension}";
                     var filePath = Path.Combine(uploadFolderPath, fileName);

          // שמירת הקובץ בשרת
                     using (var stream = new FileStream(filePath, FileMode.Create))
                     {
                         await model.File.CopyToAsync(stream);
                     }
       // יצירת URL כדי לגשת לקובץ המועלה
                     var baseUrl = $"{Request.Scheme}://{Request.Host}";
                     var fileUrl = $"{baseUrl}/Uploads/{fileName}";
         // החזרת ה-URL של הקובץ
                     return Ok(new { FilePath = fileUrl });
                 }
                 catch (Exception ex)
                 {
                     return StatusCode(StatusCodes.Status500InternalServerError, $"Error uploading file: {ex.Message}");
                 }
             }
        private void DeleteExistingFiles(string originalFileName)
             {
                 var files = Directory.GetFiles(uploadFolderPath, $"{originalFileName}*");
                 foreach (var file in files)
                 {
                     System.IO.File.Delete(file);
                 }
             }*/
}
/*public class FileUploadModel
  {
      public IFormFile File { get; set; }
 }*/