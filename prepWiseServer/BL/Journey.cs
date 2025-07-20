using prepWise.DAL;

namespace prepWise.BL
{
    public class Journey
    {

        public int JourneyID { get; set; }
        public int MatchID { get; set; }
        public bool IsSingleSession { get; set; }
        public string Notes { get; set; }

        private UsersDB db = new UsersDB();




    }
}