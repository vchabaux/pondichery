<template>
  <LayoutSidebar>
    <template #sidebar>
      <Sidebar :home="home" :links="links.sort((a, b) => a.name.localeCompare(b.name))" :user="user">
        <template #footer>
          <Container class="notifications" v-if="hasNotifications">
            <Link size="s" path="/pondichery/admin/tracks" variant="text" v-if="pending.tracks">
              <template #start><Icon name="bell" /></template>
              {{ pending.tracks }} tracks
            </Link>
            <Link size="s" path="/pondichery/admin/notices" variant="text" v-if="pending.notices">
              <template #start><Icon name="bell" /></template>
              {{ pending.notices }} notices
            </Link>
          </Container>

          <Link wide path="/pondichery" target="_blank" class="app-link">
            <template #end><Icon name="arrow-up-right-from-square" /></template>
            Open app
          </Link>

          <Container flow="row-between">
            <Link path="/pondichery/admin/profile" variant="text">
              {{ user.name }}
              {{ !fullTimeAccount && expiresIn < 30 ? ` (${expiresIn}d left)` : "" }}
            </Link>

            <Button aria-label="sign out" title="sign out" @click="signout" variant="text">
              <Icon name="arrow-right-from-bracket" />
            </Button>
          </Container>
        </template>
      </Sidebar>
    </template>

    <slot />
  </LayoutSidebar>
</template>

<script setup>
import { computed } from "vue";
import { LayoutSidebar, Sidebar, Container, Button, Icon, Link } from "@owlabio/owl-ui";
import { useStore } from "@/stores";
import { getDateDiff } from "@/utils/time";

const authStore = useStore("auth");
const noticeStore = useStore("notice");
const trackStore = useStore("track");
const settingsStore = useStore("settings");

const settings = computed(() => settingsStore.settings);
const app = computed(() => settingsStore.project);
const user = computed(() => authStore.currentUser);
const isAdmin = computed(() => user.value.role.includes("admin"));
const fullTimeAccount = computed(() => !user.value.expiresAt);
const expiresIn = computed(() => getDateDiff(user.value.expiresAt, new Date()));
const hasNotifications = computed(() => (isAdmin && pending.value.tracks) || pending.value.notices);

const home = computed(() => {
  return {
    name: settings.value.name,
    path: "/pondichery/admin",
  };
});

const links = [
  { name: "Tracks", path: "/pondichery/admin/tracks" },
  { name: "Notices", path: "/pondichery/admin/notices" },
  { name: "Categories", path: "/pondichery/admin/categories" },
];

app.value === "cnrs1" ? links.unshift({ name: "Artists", path: "/pondichery/admin/musicians" }) : links.unshift({ name: "Playlists", path: "/pondichery/admin/playlists" });

app.value === "cnrs1" ? links.push({ name: "Nakala", path: "/pondichery/admin/nakala" }) : links.push({ name: "Medias", path: "/pondichery/admin/medias" });

isAdmin.value &&
  links.push(
    { name: "Users", path: "/pondichery/admin/users" },
    { name: "Content", path: "/pondichery/admin/content" },
    { name: "Settings", path: "/pondichery/admin/settings" },
    { name: "Icons", path: "/pondichery/admin/icons" }
  );

const pending = computed(() => {
  return {
    tracks: trackStore.list.filter((p) => p.status === "pending").length,
    notices: noticeStore.list.filter((n) => n.status === "pending").length,
  };
});

function signout() {
  authStore.signout();
}
</script>

<style>
.-end {
  justify-content: end;
}

.-equal {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
}

.-astart {
  align-items: flex-start !important;
}
</style>

<style scoped>
.notifications {
  gap: var(--size-1);
}

.app-link {
  justify-content: center;
}

.app-link :deep(.owl-link-label) {
  color: var(--color-text-inverted);
}
</style>
