const checkVisitor = async function(visitors, visitorIp) {
  if (
    (await visitors
      .find({
        ip: visitorIp
      })
      .limit(1)
      .count()) < 1
  ) {
    console.log("new IP");
    col.insertOne({
      ip: visitorIp,
      date: Date.now(),
      visits: 1
    });
  } else if (
    (await visitors
      .find({
        ip: visitorIp,
        date: { $gt: Date.now() - 50000 }
      })
      .limit(1)
      .count()) < 1
  ) {
    console.log("new visit");
    visitors.updateOne(
      { ip: visitorIp },
      { $set: { date: Date.now() }, $inc: { visits: 1 } }
    );
  }
};

module.exports = checkVisitor;
