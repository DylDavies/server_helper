module.exports.help = {
  name: 'invite',
  usage: 'invite',
  description: 'Get an invite.'
}

module.exports.run = async (bot, message, args) => {
  let sent = false;
  let invites = await bot.guilds.get("461165458049990666").fetchInvites();
  invites = invites.array();

  invites.forEach(invite => {
    if (invite.inviter.id === message.author.id){
      message.channel.send(`Here is an invite for you to use!\nhttps://discord.gg/${invite.code}`);
      sent = true;
    }
  });

  if (sent === false){
    message.channel.send("We found no invites matching you...\nPlease create one and run this command to get it.");
  }
}
