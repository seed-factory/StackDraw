import React from 'react';
import { Box, Text, Stack, Anchor, Divider, Badge, Group } from '@mantine/core';
import { IconBrandGithub, IconHeart } from '@tabler/icons-react';
import { useTranslation } from 'src/stores/localeStore';

export const InfoSettings = () => {
  const { t } = useTranslation();

  return (
    <Stack gap="md">
      {/* Version Info */}
      <Box>
        <Group gap="sm" mb="xs">
          <Text fw={600} size="lg">{t('infoSettings.title')}</Text>
          <Badge variant="light" color="blue">{t('infoSettings.version')}</Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {t('infoSettings.tagline')}
        </Text>
      </Box>

      <Divider />

      {/* Team Info */}
      <Box>
        <Text fw={500} mb="xs">{t('infoSettings.developedBy')}</Text>
        <Group gap="xs">
          <Text size="sm">{t('infoSettings.team')}</Text>
        </Group>
        <Anchor
          href="https://github.com/seed-factory/StackDraw"
          target="_blank"
          size="sm"
          mt="xs"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <IconBrandGithub size={16} />
          github.com/seed-factory/StackDraw
        </Anchor>
      </Box>

      <Divider />

      {/* Credits */}
      <Box>
        <Group gap="xs" mb="xs">
          <IconHeart size={16} color="#e64980" />
          <Text fw={500}>{t('infoSettings.credits')}</Text>
        </Group>
        <Text size="sm" c="dimmed" mb="xs">
          {t('infoSettings.creditsText')}
        </Text>
        <Anchor
          href="https://github.com/stan-smith/FossFLOW"
          target="_blank"
          size="sm"
          c="dimmed"
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <IconBrandGithub size={16} />
          {t('infoSettings.originalRepo')}
        </Anchor>
      </Box>

      <Divider />

      {/* Tech Stack */}
      <Box>
        <Text fw={500} mb="xs">{t('infoSettings.builtWith')}</Text>
        <Group gap="xs">
          <Badge variant="outline" size="sm">React 19</Badge>
          <Badge variant="outline" size="sm">TypeScript</Badge>
          <Badge variant="outline" size="sm">Mantine UI</Badge>
          <Badge variant="outline" size="sm">Zustand</Badge>
        </Group>
      </Box>
    </Stack>
  );
};
