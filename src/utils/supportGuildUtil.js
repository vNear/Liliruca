const { Guild } = require('eris')

class SupportGuildUtil {
  static guildIntegrationOptions (guild, type, embedColor) {
    if (!(guild instanceof Guild)) {
      return { content: `${['I joined the server', 'I left the server'][type]} ${guild.id}` }
    }

    const fields = [
      {
        name: '\\👥 Members',
        value: `**${guild.memberCount} Users**`,
        inline: true
      },
      {
        name: '\\🌍 Region',
        value: `**${guild.region}**`,
        inline: true
      },
      {
        name: '\\🟣 Boost Tier',
        value: `**Tier ${guild.premiumTier}**`,
        inline: true
      }
    ]

    return {
      embeds: [{
        color: embedColor,
        author: { name: guild.name, icon_url: guild.dynamicIconURL() },
        footer: { text: guild.id },
        timestamp: guild.createdAt,
        fields
      }]
    }
  }

  static guildIntegration (guild, client, type, embedColor) {
    if (!process.env.WK_GUILDS_ID || !process.env.WK_GUILDS_TOKEN) {
      return
    }

    client.executeWebhook(
      process.env.WK_GUILDS_ID, process.env.WK_GUILDS_TOKEN,
      SupportGuildUtil.guildIntegrationOptions(guild, type, embedColor)
    )
  }

  static evalIntegrationOptions (author, guildName, code) {
    const tag = author.username + author.discriminator
    return {
      embeds: [{
        color: 0xff9900,
        author: { name: tag, icon_url: author.avatarURL },
        description: code,
        footer: { text: guildName }
      }]
    }
  }

  static evalIntegration (client, author, guildName, code) {
    if (!process.env.WK_EVAL_ID || !process.env.WK_EVAL_TOKEN) {
      return
    }

    client.executeWebhook(
      process.env.WK_EVAL_ID, process.env.WK_EVAL_TOKEN,
      SupportGuildUtil.evalIntegrationOptions(author, guildName, code)
    )
  }

  static updateStatsChannel (client) {
    if (!process.env.STATS_CHANNEL_ID) {
      return
    }

    client.editChannel(process.env.STATS_CHANNEL_ID, {
      name: `📌 ${client.guilds.size} Guilds`
    })
  }

  static clientJoinGuild (client, guild) {
    SupportGuildUtil.updateStatsChannel(client)
    return SupportGuildUtil.guildIntegration(guild, client, 0, 0x47d350)
  }

  static clientLeaveGuild (client, guild) {
    SupportGuildUtil.updateStatsChannel(client)
    return SupportGuildUtil.guildIntegration(guild, client, 1, 0xdb3939)
  }

  static errorChannel (client, guild, content, err) {
    if (!process.env.ERROR_CHANNEL_ID) {
      return
    }

    const embed = {
      color: 0xdb3939,
      footer: { text: guild.name, icon_url: guild.iconURL },
      timestamp: new Date(),
      fields: [
        { name: '\\📄 Message', value: `\`\`\`${content}\`\`\`` },
        { name: '\\❌ Error', value: `\`\`\`${err}\`\`\`` }
      ]
    }

    client.createMessage(process.env.ERROR_CHANNEL_ID, { embed })
  }

  static rebootChannel (client, message) {
    if (!process.env.REBOOT_CHANNEL_ID) {
      return
    }

    client.createMessage(process.env.REBOOT_CHANNEL_ID, { content: message })
  }
}

module.exports = SupportGuildUtil
