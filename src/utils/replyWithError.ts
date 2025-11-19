import {
  ChatInputCommandInteraction,
  MessageFlags,
} from "discord.js";

export async function replyWithError(
  interaction: ChatInputCommandInteraction,
  message: string
): Promise<void> {
  const content = `❌ ${message}`;

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content });
  } else {
    await interaction.reply({
      content,
      flags: MessageFlags.Ephemeral,
    });
  }
}