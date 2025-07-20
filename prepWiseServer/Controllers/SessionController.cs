using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using prepWise.BL;
using prepWise.DAL;
using System.Text.Json;
using static prepWise.DAL.SessionDB;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace prepWise.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SessionController : ControllerBase
    {
        // GET: api/<SessionController>
        [HttpGet]
        public IEnumerable<string> Get()
        {
            return new string[] { "value1", "value2" };
        }

        // GET api/<SessionController>/5
   

        // POST api/<SessionController>
        [HttpPost]
        public void Post([FromBody]string value)
        {
        }

        // PUT api/<SessionController>/5
        [HttpPut("{SessionID}")]
        public void Put(int id, [FromBody]string value)
        {
        }

        // DELETE api/<SessionController>/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }


        [HttpGet("userSessions/{jobseekerID}/{mentorID}")]
        public IActionResult GetSessionsForUser(int jobseekerID, int mentorID)
        {
            try
            {
                Session bl = new Session();
                var sessions = bl.GetSessionsByUsersIDs(jobseekerID, mentorID);
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        [HttpPost("userAddSessions/{jobseekerID}/{mentorID}")]
        public IActionResult AddSession(
    [FromBody] Session session,
    [FromQuery] string userType,
        [FromQuery] string sessionMode) // 👈 add this

        
            {
            try
            {
                if (session.JourneyID <= 0)
                {
                    return BadRequest("JourneyID is required.");
                }

                if (string.IsNullOrEmpty(userType) || (userType != "mentor" && userType != "jobSeeker"))
                {
                    return BadRequest("Missing or invalid userType. Must be 'mentor' or 'jobSeeker'.");
                }

                if (!string.IsNullOrEmpty(session.Notes))
                {
                    try
                    {
                        // Try to parse to check if it's already a JSON string
                        var existingJson = JsonSerializer.Deserialize<Dictionary<string, string>>(session.Notes);
                        // Do nothing — it's already a valid notes dictionary
                    }
                    catch
                    {
                        // Not JSON yet — so wrap it
                        var noteDict = new Dictionary<string, string>
                        {
                            [userType] = session.Notes
                        };
                        session.Notes = JsonSerializer.Serialize(noteDict);
                    }
                }


                // ✅ Use your business logic class (not SessionController)
                Session bl = new Session();
                int newId = bl.InsertSession(session);

                // ✅ If sessionMode == "add", update IsSingleSession in Journeys table
                if (!string.IsNullOrEmpty(sessionMode) && sessionMode.ToLower() == "add")
                {
                    bl.MarkJourneyAsMultipleSessions(session.JourneyID); // 👈 call this new method
                }

                return Ok(new { sessionID = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }



        [HttpGet("{sessionId}")]
        public IActionResult GetSessionForUser(int sessionId)
        {
            try
            {
                Session bl = new Session();
                var session = bl.GetSessionForUser(sessionId);

                if (session == null)
                    return NotFound();

                return Ok(session);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        private string UpdateUserNotes(string existingNotesJson, string userType, string newNote)
        {
            var notesDict = new Dictionary<string, string>();

            if (!string.IsNullOrEmpty(existingNotesJson))
            {
                try
                {
                    notesDict = JsonSerializer.Deserialize<Dictionary<string, string>>(existingNotesJson);
                }
                catch
                {
                    // If invalid JSON, reset to empty dict
                    notesDict = new Dictionary<string, string>();
                }
            }

            notesDict[userType] = newNote; // Only update that user’s note
            return JsonSerializer.Serialize(notesDict);
        }


        [HttpPut("update/{sessionID}")]
        public IActionResult UpdateSession(
    int sessionID,
    [FromBody] Session updatedSession,
    [FromQuery] string userType)
        {
            try
            {

                if (string.IsNullOrEmpty(userType) || (userType != "mentor" && userType != "jobSeeker"))
                {
                    return BadRequest("Missing or invalid userType. Must be 'mentor' or 'jobSeeker'.");
                }

                // ✅ Use business logic class
                Session bl = new Session();
                var existingSession = bl.GetSessionForUser(sessionID);

                if (existingSession == null)
                {
                    return NotFound("Session not found.");
                }

                // 🧠 Update just this user's notes in the JSON
                updatedSession.Notes = UpdateUserNotes(existingSession.Notes, userType, updatedSession.Notes ?? "");

                updatedSession.SessionID = sessionID;
                bool success = bl.UpdateSession(updatedSession);

                if (!success)
                    return NotFound("Session update failed.");

                return Ok(new { message = "Session updated successfully.", sessionID = sessionID });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }



        [HttpGet("feedback/{sessionId}/{userID}")]
        public IActionResult GetSessionFeedback(int sessionId,int userID)
        {
            try
            {
                SessionDB sessionDB = new SessionDB();
                var feedback = sessionDB.GetSessionFeedback(sessionId, userID);

                if (feedback == null)
                {
                    return NotFound("No feedback found for this session.");
                }

                return Ok(feedback);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("feedback")]
        public IActionResult AddOrUpdateSessionFeedback(int sessionId, int submittedBy, double rating, string comment)
        {
            try
            {
                // Your existing validation...

                SessionDB sessionDB = new SessionDB();
                bool success = sessionDB.UpsertSessionFeedback(sessionId, submittedBy, rating, comment);

                if (success)
                {
                    return Ok(new { message = "Feedback saved successfully." });
                }
                else
                {
                    return BadRequest("Unable to save feedback. You may not be authorized for this session.");
                }
            }
            catch (SqlException ex) when (ex.Message.Contains("not authorized"))
            {
                return BadRequest("You are not authorized to provide feedback for this session.");
            }
            catch (SqlException ex) when (ex.Message.Contains("cannot update feedback"))
            {
                return BadRequest("You cannot update feedback you did not create.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }


        [HttpPost("{sessionID}/tasks")]
        public IActionResult AddTaskToSession(int sessionID, [FromBody] Dictionary<string, object> taskData)
        {
            try
            {
                if (!taskData.ContainsKey("title"))
                    return BadRequest("Task title is required.");
                if (!taskData.ContainsKey("jobSeekerID"))
                    return BadRequest("JobSeekerID is required.");

                // Extract JsonElements safely
                var titleElement = (JsonElement)taskData["title"];
                var jobSeekerIdElement = (JsonElement)taskData["jobSeekerID"];
                var descriptionElement = taskData.ContainsKey("description") ? (JsonElement)taskData["description"] : default;

                string title = titleElement.GetString();
                int jobSeekerID = jobSeekerIdElement.GetInt32();  // <-- correct way
                string description = descriptionElement.ValueKind != JsonValueKind.Undefined ? descriptionElement.GetString() : "";

                Session logic = new Session();
                int taskId = logic.AddTaskToSession(sessionID, title, description, jobSeekerID);

                return Ok(new { TaskID = taskId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }


        [HttpGet("{sessionID}/tasks")]
        public IActionResult GetTasksForSession(int sessionID)
        {
            try
            {
                Session logic = new Session();
                var tasks = logic.GetTasksForSession(sessionID);
                return Ok(tasks);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }


        [HttpPost("TaskCompletion")]
        public IActionResult UpsertTaskCompletion([FromBody] TaskCompletionRequest request)
        {
            try
            {
                Session sessionBL = new Session();
                bool result = sessionBL.UpsertTaskCompletion(request.TaskID, request.JobSeekerID, request.IsCompleted);

                if (result)
                    return Ok(new { message = "Task completion updated successfully." });
                else
                    return BadRequest("Failed to update task completion.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        // DTO class for request body
        public class TaskCompletionRequest
        {
            public int TaskID { get; set; }
            public int JobSeekerID { get; set; }
            public bool IsCompleted { get; set; }
        }

        [HttpGet("CompletedTasks")]
        public IActionResult GetCompletedTasks([FromQuery] int sessionId, [FromQuery] int jobSeekerId)
        {
            try
            {
                Session session = new Session();
                var completedTaskIds = session.GetCompletedTasksForSession(sessionId, jobSeekerId);
                return Ok(completedTaskIds); // Returns: [1, 2, 5]
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }


        [HttpGet("TaskProgress/{jobSeekerId}")]
        public IActionResult GetTaskProgress(int jobSeekerId)
        {
            try
            {
                Session logic = new Session();
                var result = logic.GetTaskProgress(jobSeekerId);
                return Ok(new
                {
                    total = result.ContainsKey("TotalTasks") ? result["TotalTasks"] : 0,
                    completed = result.ContainsKey("CompletedTasks") ? result["CompletedTasks"] : 0
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
        [HttpDelete("{sessionID}/tasks/{taskID}")]
        public IActionResult DeleteTask(int sessionID, int taskID)
        {
            try
            {
                Session logic = new Session();
                bool deleted = logic.DeleteTask(taskID);

                if (!deleted)
                    return NotFound("Task not found");

                return Ok("Task deleted successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }
        [HttpPut("{sessionID}/tasks/{taskID}")]
        public IActionResult UpdateTask(int sessionID, int taskID, [FromBody] Dictionary<string, string> taskData)
        {
            try
            {
                if (!taskData.ContainsKey("title") || string.IsNullOrWhiteSpace(taskData["title"]))
                    return BadRequest("Task title is required");

                string title = taskData["title"];
                string description = taskData.ContainsKey("description") ? taskData["description"] : "";

                Session logic = new Session();
                bool updated = logic.UpdateTask(taskID, title, description);

                if (!updated)
                    return NotFound("Task not found or no changes made");

                return Ok("Task updated successfully");
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }
        [HttpGet("UpcomingSessionsForMentor/{mentorId}")]
        public IActionResult GetUpcomingSessionsForMentor(int mentorId)
        {
            try
            {
                Session session = new Session();
                List<MentorSessionView> result = session.GetUpcomingSessionsForMentorView(mentorId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        //or also
        /*
        [HttpGet("UpcomingSessionsForMentor/{mentorId}")]
        public List<Session> GetUpcomingSessionsForMentor(int mentorId)
        {
            Session session = new Session();
            return session.GetUpcomingSessionsForMentor(mentorId);
        }
        */

        [HttpPut("archive/{sessionId}")]
        public IActionResult ArchiveSession(int sessionId)
        {
            if (sessionId <= 0)
                return BadRequest();

            SessionDB sessionDB = new SessionDB();
            bool success = sessionDB.ArchiveSession(sessionId);

            return success ? Ok() : BadRequest();
        }


    }
}
