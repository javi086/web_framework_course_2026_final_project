# ITE5315 Final Project — Phase 1 Progress Report

**Student Name:** JOSE JAVIER SANTANA VERA  
**Student ID:** N01753766  
**Project Name:** AI Jobs Explorer API  
**Date:** November 25, 2026  
**GitHub Repository:** https://github.com/javi086/web_framework_course_2026_final_project
**Jira Board:** https://javi086mx.atlassian.net/jira/software/projects/WC/boards/2?sprintStarted=true&filter=&groupBy=none

**Exported Postman Collection:** `docs/ITE5315 - AI Jobs Explorer API.postman_collection.json`


---

## Phase 1 API Route Documentation Table
| Method & Route | Purpose and Inputs | Success / Error | Access |
| :--- | :--- | :--- | :--- |
| **GET** `/api/health` | Check server and MongoDB Atlas connection status (no secrets exposed) | `200 OK` | Public |
| **GET** `/api/jobs?limit=20` | Retrieve job postings from Atlas (default limit 20, max 50) | `200 OK` / `500 Server Error` | Public |
| **GET** `/api/jobs/:id` | Retrieve single job posting by `job_id` (e.g., `AIJOB0001`) or `_id` | `200 OK` / `404 Not Found` | Public |
| **GET** `/api/applications` | Retrieve all persisted job applications sorted newest first | `200 OK` / `500 Server Error` | Public (Phase 1) |
| **POST** `/api/applications` | Create a persistent saved job application (`jobId`, `status`, `notes`) | `201 Created` / `400 Bad Request` / `404 Job Not Found` | Public (Phase 1) |

---

##  Reflection: Challenges, Learnings & Next Steps
* **Challenge & Resolution:** When reorganizing routes into `src/routes/`, `server.js` initially threw a `MODULE_NOT_FOUND` error for `./routes`. Updating the require path to `./src/routes/routes` and mounting `/api` before legacy routes resolved the issue cleanly.
* **What I Learned:** How Mongoose schemas enforce validation rules before writing to MongoDB Atlas, and how cloud database storage provides true persistence across server restarts compared to local in-memory arrays.
* **Next Steps (Phase 2 — Due Dec 2):** Implement `PUT /api/applications/:id` and `DELETE /api/applications/:id` for full CRUD, add combined pagination (`page`, `limit`), filtering (`job_category`, `experience_level`), and sorting (`annual_salary_usd`) to `GET /api/jobs`, and centralize error handling.