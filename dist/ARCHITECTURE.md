# Architecture

- `curriculum-data.js`: immutable bundled source, loaded before app initialization.
- `modules/data-store.js`: validated schema, materialization of curriculum overrides, atomic persistence, single previous recovery snapshot. Pure functions exported for Node tests.
- `modules/scheduler.js`: pure date, streak, lesson and item scheduling rules; deterministic time arguments for tests.
- `app.js`: shared state, boot, persistence adapters and settings toggles.
- `modules/catalog.js`: curriculum display and CRUD.
- `modules/study.js`, `study-session.js`: study rendering and resumable sessions.
- `modules/item-review.js`, `reviews.js`: item queue and lesson reviews.
- `modules/ai-request.js`: bounded history, abortable transport and timeout; `ai.js` handles personas and conversation lifecycle.
- `modules/actions.js`: delegated user-content actions.
- `styles/`: ordered CSS source; `scripts/build-css.cjs` bundles without changing cascade order.
- `tests/`: Node test runner, fake storage/network and jsdom integration. No live API key required.

Data commits are one localStorage write to `kla_v4_data`. Import/reseed/reset validate and snapshot first. Existing `koreanV2` is retained during migration. Recovery is local to the same origin and is not cloud sync.


V4.2: learning-content.js chia sẻ bộ chọn mục/đáp án; daily-session.js điều phối phiên ngắn; content-feedback.js lưu cờ biên tập; tab-sync.js giữ Web Lock và thông báo xung đột. Dữ liệu phiên ngắn và cờ nằm trong extra của schema 1, được validate trước khi ghi/nhập.
