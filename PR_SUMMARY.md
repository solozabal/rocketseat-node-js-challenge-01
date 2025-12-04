# Pull Request Summary

## Branch: feature/prompt-2 → main

### Title
Implement basic CRUD for /tasks with validations (SQLite)

### Summary
This PR implements the basic CRUD for /tasks using Express and SQLite, including input validations, UUID-based IDs, and consistent timestamps. It also updates the README with usage instructions.

### Endpoints Implemented

#### POST /tasks
Creates a task with title (required) and description (optional).
Returns 201 with the created task.

#### GET /tasks
Lists tasks. Supports query parameter ?search= to filter by title or description (partial match).
Returns 200 with an array of tasks.

#### PUT /tasks/:id
Updates title and/or description. Requires at least one field.
Returns 200 with the updated task; 400 for empty body; 404 if id not found.

#### PATCH /tasks/:id/complete
Toggles completed_at between NULL and CURRENT_TIMESTAMP.
Also updates updated_at.
Returns 200 with the updated task; 404 if id not found.

#### DELETE /tasks/:id
Deletes a task by id.
Returns 204 on success; 404 if id not found.

### Validations and Behavior
- title is required (after trimming whitespace); description is optional.
- Inputs are trimmed; all SQL operations use parameterized queries.
- IDs are generated via crypto.randomUUID().
- created_at and updated_at handled via SQLite CURRENT_TIMESTAMP for consistency.

### Documentation Updates
- Updated README with Docker "How to run locally" instructions
- Added PowerShell example requests for all endpoints
- Included step-by-step Docker setup guide
- Added health check instructions

### Testing Results
All endpoints tested and verified:
✅ POST /tasks - Creates tasks with optional description
✅ GET /tasks - Lists all tasks
✅ GET /tasks?search= - Filters tasks by title/description
✅ PUT /tasks/:id - Updates tasks with validation
✅ PATCH /tasks/:id/complete - Toggles completion status
✅ DELETE /tasks/:id - Deletes tasks
✅ Validations work correctly (title required, empty body detection, 404 handling)

### Security Scan
✅ CodeQL scan completed with 0 alerts

### Code Review
✅ Code review completed and addressed

### Commits on feature/prompt-2
1. `feat(prompt-2): CRUD /tasks with validations (SQLite)` - Initial CRUD implementation
2. `docs: update README with Docker instructions and PowerShell examples` - Added documentation
3. `docs: improve PowerShell examples with clearer task ID placeholders` - Improved examples

---

## Note to Repository Owner

The `feature/prompt-2` branch is ready for a Pull Request to `main`. All code is implemented, tested, and documented. 

Since I cannot create PRs directly (due to authentication limitations), please create the PR manually using:
- **Source branch**: feature/prompt-2
- **Target branch**: main
- **Title**: Implement basic CRUD for /tasks with validations (SQLite)
- **Body**: Use the content from the "How to run locally" and "Example Requests (PowerShell)" sections in the README, along with the endpoints and validations summary above.
