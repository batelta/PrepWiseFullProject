using Microsoft.AspNetCore.Mvc;
using prepWise.BL;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace prepWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MentorsController : ControllerBase
    {
        // GET: api/<MentorsController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<MentorsController>/5
        [HttpGet("{userId}")]
        public User Get(int userId)
        {
            Mentor mentor = new Mentor();
            return mentor.readUser(userId);
        }

        [HttpGet]
        [Route("api/GetAllMentorsOffers")]
        public IActionResult GetMentorOffers([FromQuery] int? mentorUserId = null)
        {
            try
            {
                Mentor mentor = new Mentor();

                List<MentorOffer> offers;

                if (mentorUserId.HasValue)
                    offers = mentor.GetMentorOffers(mentorUserId.Value); // מנטור
                else
                    offers = mentor.GetMentorOffers(); // כל ההצעות הפעילות

                return Ok(offers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST api/<MentorsController>
        [HttpPost]
        public int PostMentor([FromBody] Mentor mentor)
        {
            return mentor.insertNewUser();
        }

        [HttpPost]
        [Route("MentorOffer")]
        public IActionResult CreateMentorOffer([FromBody] MentorOffer offer)
        {
            try
            {
                Mentor mentor = new Mentor();  // או Inject
                int newOfferId = mentor.InsertMentorOffer(offer);
                return Ok(new { offerId = newOfferId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        // PUT api/<MentorsController>/5
        [HttpPut("{id}")]
        public int Put(int id, [FromBody] Mentor mentor)
        {
            return mentor.updateUser(id);

        }

        [HttpPut]
        [Route("MentorOfferUpdate")]
        public IActionResult UpdateMentorOffer([FromBody] MentorOffer offer)
        {
            try
            {
                Mentor mentor = new Mentor();
                bool success = mentor.UpdateMentorOffer(offer);

                if (success)
                    return Ok(new { message = "Offer updated successfully" });
                else
                    return NotFound(new { message = "Offer not found" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE api/<MentorsController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }

        /*  [HttpDelete]
          [Route("MentorOffer/{offerId}")]
          public IActionResult DeleteMentorOffer(int offerId)
          {
              try
              {
                  Mentor mentor = new Mentor();  // או Inject
                  bool success = mentor.DeleteMentorOffer(offerId);

                  if (success)
                  {
                      return Ok(new { message = "Offer deleted successfully" });
                  }
                  else
                  {
                      return NotFound(new { message = "Offer not found" });
                  }
              }
              catch (Exception ex)
              {
                  return StatusCode(500, $"Internal server error: {ex.Message}");
              }
          }*/

        [HttpDelete]
        [Route("MentorOffer/{offerId}")]
        public IActionResult DeleteMentorOffer(int offerId)
        {
            try
            {
                Mentor mentor = new Mentor();
                mentor.DeleteMentorOffer(offerId); // אין צורך להחזיר bool במקרה כזה

                return NoContent(); // 204 No Content - סטנדרט למחיקה מוצלחת
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("mentorOffersforJS/{userId}")]
        public IActionResult GetMentorOffersForUser(int userId)
        {
            try
            {
                Mentor mentor = new Mentor();
                List<MentorOffer> offers = mentor.GetMentorOffersForUser(userId);

                if (offers.Count == 0)
                {
                    return NotFound(new { message = "No relevant offers found" });
                }

                return Ok(offers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("offer/{offerId}")]
        public IActionResult GetMentorOfferById(int offerId)
        {
            try
            {
                Mentor mentor = new Mentor();
                var offer = mentor.GetMentorOfferById(offerId);
                if (offer != null)
                    return Ok(offer);
                else
                    return NotFound();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

    }
}