// Alias: /explore opens the Explore tab (whose route is /discover).

import { Redirect } from 'expo-router';

export default function ExploreAlias() {
  return <Redirect href="/discover" />;
}
