import "@material/mwc-list/mwc-list";
// import {
//   mdiBug,
//   mdiFileDocument,
//   mdiHandsPray,
//   mdiHelp,
//   mdiNewspaperVariant,
//   mdiTshirtCrew,
// } from "@mdi/js";
import {
  CSSResultGroup,
  LitElement,
  TemplateResult,
  css,
  html,
  nothing,
} from "lit";
import { customElement, property, state } from "lit/decorators";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import "../../../components/ha-card";
import "../../../components/ha-clickable-list-item";
import "../../../components/ha-svg-vioneta";
import {
  HassioHassOSInfo,
  fetchHassioHassOsInfo,
} from "../../../data/hassio/host";
import { HassioInfo, fetchHassioInfo } from "../../../data/hassio/supervisor";
import "../../../layouts/hass-subpage";
// import { mdiHomeAssistant } from "../../../resources/home-assistant-logo-svg";
import { haStyle } from "../../../resources/styles";
import type { HomeAssistant, Route } from "../../../types";
import { documentationUrl } from "../../../util/documentation-url";

const JS_TYPE = __BUILD__;
const JS_VERSION = __VERSION__;

@customElement("ha-config-info")
class HaConfigInfo extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public narrow = false;

  @property({ type: Boolean }) public isWide = false;

  @property({ type: Boolean }) public showAdvanced = false;

  @property({ attribute: false }) public route!: Route;

  @state() private _osInfo?: HassioHassOSInfo;

  @state() private _hassioInfo?: HassioInfo;

  protected render(): TemplateResult {
    const hass = this.hass;
    const customUiList: Array<{ name: string; url: string; version: string }> =
      (window as any).CUSTOM_UI_LIST || [];

    return html`
      <hass-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        back-path="/config"
        .header=${this.hass.localize("ui.panel.config.info.caption")}
      >
        <div class="content">
          <ha-card outlined class="header">
            <a
              href=${documentationUrl(this.hass, "")}
              target="_blank"
              rel="noreferrer"
            >
              <ha-logo-vioneta-svg> </ha-logo-vioneta-svg>
            </a>
            <p>Vioneta Agro</p>
            <ul class="versions">
              <li>
                <span class="version-label">Core</span>
                <span class="version">${hass.connection.haVersion}</span>
              </li>
              ${this._hassioInfo
                ? html`
                    <li>
                      <span class="version-label">Supervisor</span>
                      <span class="version"
                        >${this._hassioInfo.supervisor}</span
                      >
                    </li>
                  `
                : nothing}
              ${this._osInfo
                ? html`
                    <li>
                      <span class="version-label">Operating System</span>
                      <span class="version">${this._osInfo.version}</span>
                    </li>
                  `
                : nothing}
              <li>
                <span class="version-label">
                  ${this.hass.localize(
                    "ui.panel.config.info.frontend_version_label"
                  )}
                </span>
                <span class="version">
                  ${JS_VERSION}${JS_TYPE !== "modern" ? ` ⸱ ${JS_TYPE}` : ""}
                </span>
              </li>
            </ul>
          </ha-card>
        </div>
      </hass-subpage>
    `;
  }

  protected firstUpdated(changedProps): void {
    super.firstUpdated(changedProps);

    // Legacy custom UI can be slow to register, give them time.
    const customUI = ((window as any).CUSTOM_UI_LIST || []).length;
    setTimeout(() => {
      if (((window as any).CUSTOM_UI_LIST || []).length !== customUI.length) {
        this.requestUpdate();
      }
    }, 2000);

    if (isComponentLoaded(this.hass, "hassio")) {
      this._loadSupervisorInfo();
    }
  }

  private async _loadSupervisorInfo(): Promise<void> {
    const [osInfo, hassioInfo] = await Promise.all([
      fetchHassioHassOsInfo(this.hass),
      fetchHassioInfo(this.hass),
    ]);

    this._hassioInfo = hassioInfo;
    this._osInfo = osInfo;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .content {
          padding: 28px 20px 0;
          max-width: 1040px;
          margin: 0 auto;
        }

        ha-logo-svg {
          height: 56px;
          width: 56px;
        }

        ha-card {
          max-width: 600px;
          margin: 0 auto;
          margin-bottom: 16px;
          padding: 16px;
        }

        .header {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 32px 8px 16px 8px;
        }

        .header p {
          font-size: 22px;
          font-weight: 400;
          line-height: 28px;
          text-align: center;
          margin: 24px;
        }

        .ohf {
          text-align: center;
          padding-bottom: 0;
        }

        .ohf img {
          width: 100%;
          max-width: 250px;
        }

        .versions {
          display: flex;
          flex-direction: column;
          color: var(--secondary-text-color);
          align-self: stretch;
          justify-content: flex-start;
          padding: 0 12px;
          margin: 0;
        }

        .versions li {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          font-size: 14px;
          font-weight: 400;
          padding: 4px 0;
        }

        .version-label {
          color: var(--primary-text-color);
        }

        .version {
          color: var(--secondary-text-color);
        }

        .ha-version {
          color: var(--primary-text-color);
          font-weight: 500;
          font-size: 16px;
        }

        .pages {
          margin-bottom: max(24px, env(safe-area-inset-bottom));
          padding: 4px 0;
        }

        mwc-list {
          --mdc-list-side-padding: 16px;
          --mdc-list-vertical-padding: 0;
        }

        ha-clickable-list-item {
          height: 64px;
        }

        ha-svg-icon {
          height: 24px;
          width: 24px;
          display: block;
          padding: 8px;
          color: #fff;
        }

        .icon-background {
          border-radius: 50%;
        }

        .custom-ui {
          color: var(--secondary-text-color);
          text-align: center;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-info": HaConfigInfo;
  }
}
