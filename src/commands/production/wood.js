const LilirucaCommand = require('@structures/LilirucaCommand')
const LilirucaEmbed = require('@structures/LilirucaEmbed')
const { random } = require('@utils/util')
const { getItemName, getItem, getToolInInventory, removeItem, addItemInInventory, addMultipleItemsInInventory } = require('@utils/items')
const { ENERGY_COST } = require('@constants/constant')
const { axe } = require('@constants/emojis')

class Wood extends LilirucaCommand {
  constructor () {
    super('wood', {
      aliases: ['wd'],
      emoji: axe,
      clientPermissions: [
        'embedLinks',
        'externalEmojis'
      ],
      args: [
        {
          id: 'uses',
          type: 'number',
          forceMax: 10,
          forceMin: 1,
          default: 1
        },
        {
          id: 'item',
          type: 'item',
          itemTool: 'axe'
        }
      ],
      flags: [
        {
          id: 'all',
          flags: ['all', 'a']
        }
      ]
    })
  }

  async exec ({ t, ct, util, db, author }, { uses, item, all }) {
    const data = await db.users.ensure(author.id)

    if (all) {
      uses = Math.floor(data.energy / 10)
    }

    const energyCost = ENERGY_COST * uses
    if (!energyCost || data.energy < energyCost) {
      return util.send(t('errors:noEnergy'))
    }

    if (item && !data.items[item.id]) {
      return util.send(ct('noAxe'))
    }

    const tool = item || getToolInInventory(data, 'axe')
    if (!tool) {
      return util.send(ct('noAxe'))
    }

    if (data.items[tool.id] < uses) {
      return util.send(ct('insufficient'))
    }

    const wood = getItem('wood')
    const amount = random((tool.max * uses), (tool.min * uses), true)

    const fields = [
      {
        name: `${tool.emoji} ${t('commons:tool')}`,
        value: `**x${uses} ${getItemName(tool.id, t)}**`,
        inline: true
      },
      {
        name: `${wood.emoji} ${t('commons:wood')}`,
        value: `**${amount}**`,
        inline: true
      }
    ]

    const stats = {
      wood: amount,
      [tool.id]: uses
    }

    removeItem(data, 'items', tool.id, uses)
    addItemInInventory(data, 'items', 'wood', amount)
    addMultipleItemsInInventory(data, 'statistics', stats)

    const values = {
      energy: data.energy - energyCost
    }

    const embed = new LilirucaEmbed()
      .addFields(fields)
      .setFooter(t('commons:currentEnergy', { energy: values.energy }))

    db.users.update(data, values)

    util.send(`\\${axe} ${ct('success')}`, embed)
  }
}

module.exports = Wood
