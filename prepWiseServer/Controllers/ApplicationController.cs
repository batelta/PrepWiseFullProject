using Microsoft.AspNetCore.Mvc;
using prepWise.BL;
using prepWise.DAL;
using System.Text.Json;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace prepWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ApplicationController : ControllerBase
    {
        [HttpGet]
        public IEnumerable<Application> Get()
        {
            Application application = new Application();
            return application.ReadAllApplications();
        }


        // GET api/<ValuesController>/5
        [HttpGet("{id}")]
        public string Get(int id)
        {
            return "value";
        }

        [HttpPost("fetch-job")]
        public async Task<IActionResult> FetchJob([FromBody] JsonElement body)
        {
            string url;

            try
            {
                url = body.GetProperty("URL").GetString();
            }
            catch
            {
                return BadRequest("Missing or invalid 'URL' field in request body.");
            }
            //check url is not null
            if (string.IsNullOrWhiteSpace(url))
            {
                return BadRequest("URL is required.");
            }
            //take the html from the url
            string htmlContent;
            try
            {
                ///שולח בקשת GET לכתובת ומקבל את תוכן הדף כ-HTML.

                using var httpClient = new HttpClient();
                htmlContent = await httpClient.GetStringAsync(url);

                //print first 2000 chars for checking
                Console.WriteLine(" HTML content (first 2000 chars):");
                Console.WriteLine(htmlContent.Substring(0, Math.Min(2000, htmlContent.Length)));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $" Failed to fetch HTML: {ex.Message}");
            }
            //the prompt from Geimini - will improve later
            var prompt = $@"
Extract the following fields from the HTML below. 
Return a JSON object with these exact keys:

- JobTitle: The job title.
- JobDescription: A concise 2–3 sentence summary of the job opportunity. Include the role's main responsibilities, technologies or skills required, and the job's purpose. Avoid general marketing text.
- CompanyName: The name of the company posting the job.
- CompanySummary: A short, 1–2 sentence overview of the company's activity, industry, or mission. 
  Avoid repeating job description content. Use information from sections like 'About Us', 'Company Info', or header/footer.

Return only valid JSON. Do not add any explanation or formatting.

HTML content:
{htmlContent}
".Trim();

            Console.WriteLine(" Prompt to Gemini (first 1500 chars):");
            Console.WriteLine(prompt.Substring(0, Math.Min(1500, prompt.Length)));

            //gemini api key
            var apiKey = "AIzaSyChUXRg1ZyJOG1mxzqVuhnZE3vN89V3YSY";

            //api reqest to gemini
            var geminiApiUrl = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={apiKey}";

            //preper reqest body
            var requestBody = new
            {
                contents = new[]
                {
            new
            {
                role = "user",
                parts = new[]
                {
                    new { text = prompt }
                }
            }
        }
            };

            HttpResponseMessage geminiResponse;
            try
            {
                using var httpClient = new HttpClient();
                geminiResponse = await httpClient.PostAsJsonAsync(geminiApiUrl, requestBody);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $" Error contacting Gemini API: {ex.Message}");
            }

            if (!geminiResponse.IsSuccessStatusCode)
            {
                return StatusCode((int)geminiResponse.StatusCode, " Gemini API request failed.");
            }

            //read geimini answer
            var geminiJson = await geminiResponse.Content.ReadFromJsonAsync<JsonElement>();
            var rawText = geminiJson
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            Console.WriteLine("📥 Gemini raw text:");
            Console.WriteLine(rawText);


            //verift the json 
            if (rawText.StartsWith("```json"))
            {
                rawText = rawText.Replace("```json", "").Replace("```", "").Trim();
            }

            //conver json the geminiResult object
            GeminiResult result;
            try
            {
                result = JsonSerializer.Deserialize<GeminiResult>(rawText);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $" Failed to parse Gemini response: {ex.Message}");
            }

            //conver to application object
            var application = Application.FromGeminiResult(result, url);

            return Ok(application);
        }

        [HttpPost("link-file-to-application")]
        /* public IActionResult LinkFileToApplication([FromBody] LinkRequest req)
         {
             try
             {
                 UsersDB db = new UsersDB();
                 db.LinkFileToApplication(req.ApplicationID, req.FileID);
                 return Ok("Linked successfully");
             }
             catch (Exception ex)
             {
                 return StatusCode(500, ex.Message);
             }
         }*/


        public IActionResult LinkFileToApplication([FromBody] LinkRequest req)
        {
            try
            {
                UsersDB db = new UsersDB();
                bool wasLinked = db.LinkFileToApplication(req.ApplicationID, req.FileID);

                if (wasLinked)
                    return Ok("File linked successfully");
                else
                    return StatusCode(208, "File was already linked to this application");
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }

        public class LinkRequest
        {
            public int ApplicationID { get; set; }
            public int FileID { get; set; }
        }







        // PUT api/<ValuesController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<ValuesController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}