namespace prepWise.BL
{
    public class RegisterUserForm
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public bool IsMentor { get; set; }
        public string? Picture { get; set; }
        public string? CareerField { get; set; }
        public string? Experience { get; set; }
        public string? Language { get; set; }
        public string? FacebookLink { get; set; }
        public string? LinkedInLink { get; set; }
        public string? Roles { get; set; }
        public string? Company { get; set; }
        public string? MentoringType { get; set; }
        public bool IsHr { get; set; }
        public string Gender { get; set; }

        public IFormFile? File { get; set; }
        public string? FileType { get; set; }
    }
}
