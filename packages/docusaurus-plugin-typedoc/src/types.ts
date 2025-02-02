export interface PluginOptions {
  id: string;
  docsRoot: string;
  out: string;
  sidebar: SidebarOptions;
  readmeTitle?: string;
  globalsTitle?: string;
  plugin: string[];
  readme?: string;
  disableOutputCheck?: boolean;
  entryPoints?: string[];
  watch: boolean;
}

export interface FrontMatter {
  id: string;
  title: string;
  slug?: string;
  sidebar_label?: string;
  sidebar_position?: number;
  hide_title?: boolean;
  hide_table_of_contents?: boolean;
}

export interface SidebarOptions {
  fullNames?: boolean;
  sidebarFile: string; //deprecated
  categoryLabel: string;
  indexLabel?: string;
  readmeLabel?: string;
  position: number | null;
}

export interface Sidebar {
  [sidebarId: string]: SidebarItem[];
}

export interface SidebarCategory {
  type: string;
  label: string;
  items: SidebarItem[];
}

export type SidebarItem = SidebarCategory | string;
