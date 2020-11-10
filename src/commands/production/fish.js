const LilirucaCommand = require('@structures/LilirucaCommand')
const LilirucaEmbed = require('@structures/LilirucaEmbed')
const { random, randomChances } = require('@utils/util')
const { getItemById, getToolInInventory, removeItem, addItemInInventory } = require('@utils/items')
const { RARE_FISHES, WEIGHTS, TREASURE, ENERGY_COST, EMOJIS } = require('@constants')

class Fish extends LilirucaCommand {
  constructor () {
    super('fish', {
      aliases: ['fh'],
      emoji: EMOJIS.fishingpole,
      editable: true,
      clientPermissions: [
        'EMBED_LINKS',
        'USE_EXTERNAL_EMOJIS'
      ],
      args: [
        {
          id: 'itemId',
          type: 'itemId'
        }
      ]
    })
  }

  async exec ({ t, ct, util, db, author }, { itemId }) {
    const data = await db.users.get(author.id)
    const dataPlace = data.fishing

    if (!dataPlace.level) {
      return util.send(t('errors:locked'))
    }

    if (data.energy < ENERGY_COST) {
      return util.send(t('errors:noEnergy'))
    }

    const baits = (data.items[itemId] && getItemById(itemId)) || getToolInInventory(data, 'baits')
    if (!baits) {
      return util.send(ct('noBaits'))
    }

    const baitsId = itemId || baits.id
    const baitsItem = itemId ? baits : baits.item

    const catched = randomChances(baitsItem.chances)
    const weight = random(WEIGHTS[catched].max, WEIGHTS[catched].min, true)
    const emojis = EMOJIS[catched]

    const hook = this[catched]
    const fished = hook(emojis, weight, data.statistics)
    const emoji = fished.emoji || emojis[random(emojis.length)]
    const reward = catched === 'treasure' ? 'reward' : 'price'
    const fields = [
      {
        name: `${emoji} ${t('commons:fished')}`,
        value: `**${ct(catched)}**`,
        inline: true
      },
      {
        name: `\\${EMOJIS.balance} ${t('commons:weight')}`,
        value: `**${weight}kg**`,
        inline: true
      },
      {
        name: `\\${EMOJIS.money} ${t(`commons:${reward}`)}`,
        value: `**${fished.reward}**`,
        inline: true
      }
    ]

    removeItem(data, 'items', baitsId)

    const embed = new LilirucaEmbed()
      .addFields(fields)

    if (catched === 'trash') {
      embed.setDescription(`\\♻️ ${ct('recycle')}`)
    }

    if (catched === 'rare') {
      const fish = t(`commons:rares.${fished.fish}`)
      const newEmoji = fished.new ? `\\${EMOJIS.news} ` : ''

      addItemInInventory(data, 'statistics', fished.fish, 1)

      embed.setDescription(newEmoji + ct('fishRare', { fish }))
    }

    addItemInInventory(data, 'statistics', catched, 1)

    const values = {
      energy: data.energy - ENERGY_COST,
      money: data.money + (fished.money || 0),
      lilistars: data.lilistars + (fished.stars || 0)
    }

    embed.setFooter(t('commons:currentEnergy', { energy: values.energy }))

    db.users.update(data, values)

    util.send(`\\${EMOJIS.fishingpole} ${ct('success')}`, embed)
  }

  rare (emojis, weight, rares) {
    const fish = RARE_FISHES[random(RARE_FISHES.length)]
    const money = weight * 25

    return {
      fish,
      money,
      emoji: emojis[fish],
      new: !rares[fish],
      reward: `$${money}`
    }
  }

  treasure () {
    const money = random(TREASURE.money.max, TREASURE.money.min, true)
    const stars = random(TREASURE.lilistars.max, TREASURE.lilistars.min, true)
    return {
      reward: `$${money} + ${stars} Lilistars`,
      money,
      stars
    }
  }

  trash (_, weight) {
    const money = weight * 2
    return {
      reward: `$${money}`,
      money
    }
  }

  fish (_, weight) {
    const money = weight * 20
    return {
      reward: `$${money}`,
      money
    }
  }
}

module.exports = Fish
