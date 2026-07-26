import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_SITE_CONTENT,
  type SiteContent,
} from "@/lib/site-content-types";

type SiteContentState = {
  content: SiteContent;
  loading: boolean;
  initialized: boolean;
};

const initialState: SiteContentState = {
  content: DEFAULT_SITE_CONTENT,
  loading: false,
  initialized: false,
};

const siteContentSlice = createSlice({
  name: "siteContent",
  initialState,
  reducers: {
    setSiteContentLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setSiteContent(state, action: PayloadAction<SiteContent>) {
      state.content = action.payload;
      state.loading = false;
      state.initialized = true;
    },
  },
});

export const { setSiteContentLoading, setSiteContent } =
  siteContentSlice.actions;

export default siteContentSlice.reducer;

export const selectSiteContent = (state: { siteContent: SiteContentState }) =>
  state.siteContent.content;
