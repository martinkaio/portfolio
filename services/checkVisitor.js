const checkVisitor = async function(visitors, visitorIp) {
  if (
    (await visitors
      .find({
        ip: visitorIp,
        date: { $gt: Date.now() - 900000 }
      })
      .limit(1)
      .count()) < 1
  ) {
    await visitors.updateOne(
      { ip: visitorIp },
      { $set: { date: Date.now() }, $inc: { visits: 1 } },
      { upsert: true }
    );
  }
};

module.exports = checkVisitor;
