using Microsoft.VisualBasic.FileIO;

namespace prepWise.BL
{
    public class UserFile
    {

        public int FileID { get; set; }
        public int UserID { get; set; }
        public string FileName { get; set; }
        public string FilePath { get; set; }
        public DateTime UploadedAt { get; set; }
        public bool IsDefault { get; set; }
        public string FileType { get; set; }



        public static UserFile Save(IFormFile file, string fileType)
        {
            var uploadFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "userFiles");
            Directory.CreateDirectory(uploadFolder);

            var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var fullPath = Path.Combine(uploadFolder, uniqueFileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            var relativePath = $"/Images/UserFiles/{uniqueFileName}";
            //var relativePath = $"/Images/userFiles/{uniqueFileName}";


            return new UserFile
            {
                FileName = file.FileName,
                FilePath = relativePath,
                FileType = fileType,
                UploadedAt = DateTime.Now,
                IsDefault = true
            };
        }
    }
}