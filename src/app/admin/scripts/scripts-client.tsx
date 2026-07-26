"use client";

import { updateSiteSetting } from "@/app/actions/admin";
import {
  AdminSubmitButton,
  useAdminAction,
} from "@/components/admin/admin-forms";

export function ScriptsForms({
  headerScripts,
  footerScripts,
}: {
  headerScripts: string;
  footerScripts: string;
}) {
  const headerAction = useAdminAction(updateSiteSetting);
  const footerAction = useAdminAction(updateSiteSetting);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-poppins text-[15px] font-semibold text-ink">
          Header scripts
        </h2>
        <p className="mb-4 font-poppins text-[13px] text-body">
          Injected into the website{" "}
          <code className="rounded bg-[#f5f5f5] px-1">&lt;head&gt;</code>. Use
          for meta tags, Google Tag Manager, Facebook Pixel head snippets, etc.
        </p>
        <form
          action={headerAction.formAction}
          className="space-y-3"
          onSubmit={(e) => {
            const form = e.currentTarget;
            const fd = new FormData(form);
            const code = String(fd.get("code") ?? "");
            const hidden = form.querySelector<HTMLInputElement>(
              'input[name="value"]',
            );
            if (hidden) hidden.value = JSON.stringify(code);
          }}
        >
          <input type="hidden" name="key" value="header_scripts" />
          <input type="hidden" name="value" defaultValue="" />
          <textarea
            name="code"
            rows={10}
            defaultValue={headerScripts}
            placeholder={'<!-- Example -->\n<script>...</script>'}
            className="w-full rounded-lg border border-[#cfcfcf] bg-[#fafafa] px-3.5 py-3 font-mono text-[12px] leading-5 text-ink outline-none focus:border-salmon"
            spellCheck={false}
          />
          <AdminSubmitButton
            pending={headerAction.pending}
            label="Save header scripts"
          />
        </form>
      </div>

      <div className="rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-sm">
        <h2 className="mb-1 font-poppins text-[15px] font-semibold text-ink">
          Footer scripts
        </h2>
        <p className="mb-4 font-poppins text-[13px] text-body">
          Injected at the end of{" "}
          <code className="rounded bg-[#f5f5f5] px-1">&lt;body&gt;</code>. Use
          for chat widgets, analytics body tags, or custom JS.
        </p>
        <form
          action={footerAction.formAction}
          className="space-y-3"
          onSubmit={(e) => {
            const form = e.currentTarget;
            const fd = new FormData(form);
            const code = String(fd.get("code") ?? "");
            const hidden = form.querySelector<HTMLInputElement>(
              'input[name="value"]',
            );
            if (hidden) hidden.value = JSON.stringify(code);
          }}
        >
          <input type="hidden" name="key" value="footer_scripts" />
          <input type="hidden" name="value" defaultValue="" />
          <textarea
            name="code"
            rows={10}
            defaultValue={footerScripts}
            placeholder={'<!-- Example -->\n<script>...</script>'}
            className="w-full rounded-lg border border-[#cfcfcf] bg-[#fafafa] px-3.5 py-3 font-mono text-[12px] leading-5 text-ink outline-none focus:border-salmon"
            spellCheck={false}
          />
          <AdminSubmitButton
            pending={footerAction.pending}
            label="Save footer scripts"
          />
        </form>
      </div>

      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 font-poppins text-[12px] text-amber-800">
        Only paste trusted code (your own tracking/chat scripts). These run on
        every public page of the storefront.
      </p>
    </div>
  );
}
