import { getDefaultApplication, open } from "@raycast/api";

export const handleOpenFile = async (file: string) => {
  const mdApplication = await getDefaultApplication(file);
  await open(file, mdApplication.bundleId);
};
