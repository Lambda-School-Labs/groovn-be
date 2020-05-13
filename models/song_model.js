const db = require("../data/db_config");

module.exports = {
  add,
  find,
  findBy,
  findById,
  update,
  remove,
};

async function add(data) {
  const [ id ] = await db("songs").insert(data, "id");

  return findById(id);
}

function find() {
  return db("songs");
}

function findBy(filter) {
  return db("songs").where(filter);
}

function findById(id) {
  return db("songs")
    .where({ id })
    .select("deezer_id", "title_short", "artist_name", "preview")
    .first();
}

function update(data, id) {
  return db("songs").where(id).update(data);
}

function remove(id) {
  return db("songs").where(id).del();
}
