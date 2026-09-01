// GET /api/health
function getHealth(req, res) {
  res.json({
    ok: true,
    message: 'Decode.IC backend is running',
  });
}

module.exports = { getHealth };
