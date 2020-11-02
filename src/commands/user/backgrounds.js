const { Argument } = require('discord-akairo')
const LilirucaCommand = require('@structures/LilirucaCommand')
const LilirucaEmbed = require('@structures/LilirucaEmbed')
const { backgrounds, EMOJIS: { card } } = require('@constants')

class Backgrounds extends LilirucaCommand {
  constructor () {
    super('backgrounds', {
      aliases: ['bs'],
      emoji: card,
      editable: true,
      clientPermissions: 'EMBED_LINKS',
      args: [
        {
          id: 'id',
          type: Argument.range('integer', 1, backgrounds.length),
          default: 1
        }
      ]
    })
  }

  exec ({ ct, util }, { id }) {
    const embed = new LilirucaEmbed()
      .setImage(`https://cdn.discordapp.com/attachments/612335526019596289/${backgrounds[id - 1]}`)

    util.send(ct('success', { id }), embed)
  }
}

module.exports = Backgrounds