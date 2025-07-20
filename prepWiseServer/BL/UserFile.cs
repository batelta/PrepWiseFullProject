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

    }
}