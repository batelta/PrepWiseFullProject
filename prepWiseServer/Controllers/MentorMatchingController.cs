using Microsoft.AspNetCore.Mvc;
using prepWise.BL;
using prepWise.DAL;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using System.Globalization;
using System.Text.Json;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace prepWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MentorMatchingController : ControllerBase
    {
        // GET: api/<MentorMatchingController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }


        // POST api/<MentorMatchingController>



        [HttpPost("FindMentor")]
        public ActionResult<List<Mentor>> FindMentor([FromBody] JsonElement request)
        {
            try
            {
                int userID = request.GetProperty("userID").GetInt32();
                string gender = request.GetProperty("gender").GetString();
                bool mentorRole = request.GetProperty("mentorRole").GetBoolean();
                string guidanceType = request.GetProperty("guidanceType").GetString();

                // Languages array
                var mentorLanguages = request.GetProperty("preferredLanguages")
                    .EnumerateArray()
                    .Select(l => l.GetString())
                    .ToList();

                // Companies array
                var mentorCompanies = request.GetProperty("preferredCompanies")
                    .EnumerateArray()
                    .Select(c => c.GetString())
                    .ToList();

                bool isLanguageImportant = request.GetProperty("isLanguageImportant").GetBoolean();
                bool isCompanyImportant = request.GetProperty("isCompanyImportant").GetBoolean();
                bool isGenderImportant = request.GetProperty("isGenderImportant").GetBoolean();

                UsersDB db = new UsersDB();
                var userTraits = db.GetTraitsByUserId(userID);

                var matchedMentors = db.FindBestMentor(
                    userID,
                    gender,
                    mentorRole,
                    mentorLanguages,
                    guidanceType,
                    userTraits,
                    mentorCompanies,
                    isLanguageImportant,
                    isCompanyImportant,
                    isGenderImportant
                );

                if (matchedMentors == null || matchedMentors.Count == 0)
                    return NotFound("No suitable mentor found.");

                return Ok(matchedMentors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error while matching: " + ex.Message);
            }
        }


        [HttpGet("export-feature-data")]
        public IActionResult ExportFeatureData()
        {
            try
            {
                var user = new User();

                // צור קובץ זמני (לא נשמר ב
                string tempFile = Path.GetTempFileName();
                user.ExportFeatureDataToCsv(tempFile);

                // קרא את תוכן הקובץ
                byte[] fileBytes = System.IO.File.ReadAllBytes(tempFile);

                // מחק אותו מיד אחרי
                System.IO.File.Delete(tempFile);

                // בנה שם קובץ
                string fileName = $"FeatureData_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

                // החזר את הקובץ כקובץ להורדה
                return File(fileBytes, "text/csv", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error generating file: {ex.Message}");
            }
        }

        /* [HttpGet("export-feature-data")]
         public IActionResult ExportFeatureData()
         {
             try
             {
                 // לשימוש בדמו – נשתמש בקובץ שמור מראש במקום לייצא מה-DB
                 string mockPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "MockData", "Synthetic_Full_Matching_Data.csv");

                 if (!System.IO.File.Exists(mockPath))
                 {
                     return NotFound("Mock feature data file not found.");
                 }

                 byte[] fileBytes = System.IO.File.ReadAllBytes(mockPath);
                 return File(fileBytes, "text/csv", "features.csv");
             }
             catch (Exception ex)
             {
                 return StatusCode(500, $"Error returning mock file: {ex.Message}");
             }
         }*/



        [HttpGet("UserMatches/{userId}")]
        public IActionResult GetAllUserMatches(int userId, [FromQuery] string userType)
        {
            try
            {
                if (string.IsNullOrEmpty(userType) || (userType != "mentor" && userType != "jobSeeker"))
                {
                    return BadRequest("Missing or invalid userType. Must be 'mentor' or 'jobSeeker'.");
                }

                User user = new User();
                var matches = user.GetAllUserMatches(userId, userType);
                return Ok(matches);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }


        [HttpGet("get-graphs/{version}")]
        public async Task<IActionResult> GetGraphs(int version)
        {
            var path = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "Analytics", "Graphs", $"v{version}", "weights.json");

            if (!System.IO.File.Exists(path))
            {
                Console.WriteLine($" No graphs found for version {version}");
                return NotFound(new { error = "No saved graphs for this version." });
            }

            var json = await System.IO.File.ReadAllTextAsync(path);
            var result = JsonSerializer.Deserialize<Dictionary<string, object>>(json);

            Console.WriteLine($" Returning graphs for version {version}");

            return Ok(new
            {
                version = version,
                graphList = result.GetValueOrDefault("graphList"),
                summary = result.GetValueOrDefault("summary"),
                weights = result.GetValueOrDefault("weights"),
                csv_base64 = result.GetValueOrDefault("csv_base64")
            });
        }


        //to show in Admin section the latest version when first render the page
        [HttpGet("get-latest-version")]
        public ActionResult GetLatestVersion()
        {
            try
            {
                var user = new User();
                int version = user.GetLatestVersion();

                Console.WriteLine($"Latest version is {version}");

                return Ok(new { version = version });
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Error getting latest version: {ex.Message}");
                return StatusCode(500, "Error getting version: " + ex.Message);
            }
        }




        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpGet("get-all-versions")]
        public ActionResult GetAllVersions()
        {
            try
            {
                var graphFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "Analytics", "Graphs");

                if (!Directory.Exists(graphFolder))
                    return Ok(new List<int>());  // אין תיקיה => אין גרסאות

                var versions = Directory.GetDirectories(graphFolder, "v*")
                    .Select(dir => new DirectoryInfo(dir).Name) // "v10"
                    .Select(name =>
                    {
                        var part = name.Replace("v", "");
                        return int.TryParse(part, out int v) ? v : -1;
                    })
                    .Where(v => v > 0)
                    .OrderByDescending(v => v)
                    .ToList();

                return Ok(new { versions = versions });
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Error getting all versions: {ex.Message}");
                return StatusCode(500, "Error getting all versions");
            }
        }

        [ApiExplorerSettings(IgnoreApi = true)]
        [HttpPost("run-analysis")]
        public async Task<IActionResult> RunAnalysis([FromForm] IFormFile file)
        {
            Console.WriteLine(" RunAnalysis called");

            if (file == null || file.Length == 0)
            {
                Console.WriteLine(" No file uploaded");
                return BadRequest("No file uploaded.");
            }

            // 1️⃣ שמירת קובץ זמני
            var tempPath = Path.GetTempFileName();
            using (var stream = System.IO.File.Create(tempPath))
            {
                await file.CopyToAsync(stream);
            }

            Console.WriteLine($" File saved to {tempPath}");

            // 2️⃣ הכנה להרצת פייתון
            var scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "MatchingAnalysis", "run_analysis.py");

            var start = new ProcessStartInfo
            {
                FileName = "python", // בהנחה ש־python זמין במערכת
                Arguments = $"\"{scriptPath}\" \"{tempPath}\"",
                UseShellExecute = false,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                CreateNoWindow = true
            };

            using (var process = Process.Start(start))
            {
                var output = await process.StandardOutput.ReadToEndAsync();
                var error = await process.StandardError.ReadToEndAsync();

                process.WaitForExit();

                Console.WriteLine(" Python output: " + output);
                Console.WriteLine(" Python error: " + error);
                Console.WriteLine($" Python exit code: {process.ExitCode}");

                if (process.ExitCode != 0)
                {
                    return StatusCode(500, $"Python error: {error}");
                }

                // 3️⃣ שמירת גרסה חדשה
                Console.WriteLine($" Inserting new version to DB");
                var user = new User();
                int newVersionID = user.InsertNewVersion();
                Console.WriteLine($" InsertNewVersion done. New version: {newVersionID}");

                // 4️⃣ עיבוד התוצאה
                var dict = JsonSerializer.Deserialize<Dictionary<string, object>>(output);
                dict["version"] = newVersionID;

                // 5️⃣ שמירת לקבצים
                var versionFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "Analytics", "Graphs", $"v{newVersionID}");
                Directory.CreateDirectory(versionFolder);

                var jsonPath = Path.Combine(versionFolder, "weights.json");
                var csvPath = Path.Combine(versionFolder, "weights.csv");

                // Save JSON
                await System.IO.File.WriteAllTextAsync(jsonPath, JsonSerializer.Serialize(dict, new JsonSerializerOptions { WriteIndented = true }));
                Console.WriteLine($" Output JSON saved to {jsonPath}");

                // Save CSV
                var weights = ((JsonElement)dict["weights"]).EnumerateArray();

                var csvLines = new List<string>();
                csvLines.Add("ParameterName,NewWeight");

                foreach (var item in weights)
                {
                    string param = item.GetProperty("ParameterName").GetString();
                    double newWeight = item.GetProperty("NewWeight").GetDouble();

                    csvLines.Add($"{param},{newWeight}");
                }

                await System.IO.File.WriteAllLinesAsync(csvPath, csvLines);
                Console.WriteLine($" Output CSV saved to {csvPath}");

                // 6️⃣ מחזירים ללקוח
                return Ok(dict);
            }
        }



        [HttpPost("set-active-version/{version}")]
        public IActionResult SetActiveVersion(int version)
        {
            try
            {
                UsersDB db = new UsersDB();
                db.SetActiveVersion(version);
                Console.WriteLine($"Version {version} marked as active.");
                return Ok(new { message = $"Version {version} is now active." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Error setting active version: {ex.Message}");
                return StatusCode(500, $"Error setting active version: {ex.Message}");
            }
        }

        //import weights to DB and mark version as acvtive one
        [HttpPost("import-weights/{version}")]
        public IActionResult ImportWeights(int version)
        {
            try
            {
                var db = new UsersDB();

                // הגנה: אם הגרסה כבר קיימת — אל תטעין שוב!
                bool exists = db.IsVersionImported(version);
                if (exists)
                {
                    return BadRequest($"Version {version} already imported.");
                }

                // הנתיב של הקובץ
                string csvPath = Path.Combine(Directory.GetCurrentDirectory(), "uploadedFiles", "Analytics", "Graphs", $"v{version}", "weights.csv");

                if (!System.IO.File.Exists(csvPath))
                {
                    return NotFound($"weights.csv not found for version {version}");
                }

                var lines = System.IO.File.ReadAllLines(csvPath);

                // נניח שיש כותרת — נתחיל משורה 1
                for (int i = 1; i < lines.Length; i++)
                {
                    var columns = lines[i].Split(',');

                    if (columns.Length >= 2)
                    {
                        string paramName = columns[0].Trim();
                        double weightValue;

                        if (double.TryParse(columns[1].Trim(), NumberStyles.Any, CultureInfo.InvariantCulture, out weightValue))
                        {
                            db.ImportWeight(version, paramName, weightValue);
                        }
                        else
                        {
                            Console.WriteLine($" Could not parse weight for param '{paramName}' in version {version}");
                        }
                    }
                }

                // לסמן את הגרסה כאקטיבית
                db.SetActiveVersion(version);

                Console.WriteLine($" Weights imported for version {version}");
                return Ok(new { message = $"Weights imported for version {version}" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Error importing weights: {ex.Message}");
                return StatusCode(500, $"Error importing weights: {ex.Message}");
            }
        }


        //return true/false if this version Weights alredy in the DB
        [HttpGet("is-version-imported/{version}")]
        public IActionResult IsVersionImported(int version)
        {
            try
            {
                UsersDB db = new UsersDB();
                bool exists = db.IsVersionImported(version);
                return Ok(new { exists });
            }
            catch (Exception ex)
            {
                Console.WriteLine($" Error checking if version exists: {ex.Message}");
                return StatusCode(500, $"Error checking version: {ex.Message}");
            }
        }

        [HttpGet("get-active-version")]
        public IActionResult GetActiveVersion()
        {
            try
            {
                var db = new UsersDB();
                int activeVersion = db.GetActiveVersion();
                return Ok(new { activeVersion });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }


        // PUT api/<MentorMatchingController>/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/<MentorMatchingController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }




    }
}