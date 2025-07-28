export interface ZoomMeetingResponse {
  id: string;
  topic: string;
  start_time: string;
  duration: number;
  join_url: string;
  password: string;
  host_id: string;
}

interface CreateZoomMeetingData {
  topic: string;
  start_time: string;
  duration: number;
  timezone?: string;
}

interface ZoomOAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export class ZoomAPI {
  private baseUrl = "https://api.zoom.us/v2";
  private oauthUrl = "https://zoom.us/oauth/token";
  private accessToken: string | null = null;
  private tokenExpiry = 0;

  constructor() {
    // For Server-to-Server OAuth, we don't need to store tokens as they're generated per request
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      throw new Error(
        "Missing Zoom OAuth credentials. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET"
      );
    }

    try {
      // Server-to-Server OAuth with proper URL encoding
      const params = new URLSearchParams({
        grant_type: "account_credentials",
        account_id: accountId,
      });

      const response = await fetch(this.oauthUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = response.statusText;

        try {
          const error = JSON.parse(errorText);
          errorMessage =
            error.error_description || error.error || response.statusText;
        } catch {
          errorMessage = errorText || response.statusText;
        }

        throw new Error(`OAuth Error (${response.status}): ${errorMessage}`);
      }

      const tokenData: ZoomOAuthTokenResponse = await response.json();

      // Store token and expiry time
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in - 60) * 1000; // Refresh 1 minute early

      return this.accessToken;
    } catch (error) {
      console.error("Error getting Zoom access token:", error);
      throw error;
    }
  }

  async createMeeting(
    data: CreateZoomMeetingData
  ): Promise<ZoomMeetingResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/users/me/meetings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: data.topic,
          type: 2, // Scheduled meeting
          start_time: data.start_time,
          duration: data.duration,
          timezone: data.timezone || "Asia/Bangkok",
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            watermark: false,
            use_pmi: false,
            approval_type: 0, // Automatically approve
            audio: "both",
            auto_recording: "none",
            waiting_room: true,
            allow_multiple_devices: true,
            meeting_authentication: false,
            registrants_email_notification: false,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Zoom API Error: ${error.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating Zoom meeting:", error);
      throw error;
    }
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        const error = await response.json();
        throw new Error(
          `Zoom API Error: ${error.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error deleting Zoom meeting:", error);
      throw error;
    }
  }

  async getMeeting(meetingId: string): Promise<ZoomMeetingResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Zoom API Error: ${error.message || response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Error getting Zoom meeting:", error);
      throw error;
    }
  }

  async updateMeeting(
    meetingId: string,
    data: Partial<CreateZoomMeetingData>
  ): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Zoom API Error: ${error.message || response.statusText}`
        );
      }
    } catch (error) {
      console.error("Error updating Zoom meeting:", error);
      throw error;
    }
  }

  // Test connection
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    userInfo?: {
      email: string | undefined | null;
      account_id?: string;
      display_name?: string;
    };
  }> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = response.statusText;

        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || error.error || response.statusText;
        } catch {
          errorMessage = errorText || response.statusText;
        }

        return {
          success: false,
          message: `API Error (${response.status}): ${errorMessage}`,
        };
      }

      const userInfo = await response.json();
      return {
        success: true,
        message: "เชื่อมต่อ Zoom API สำเร็จ",
        userInfo: {
          email: userInfo.email,
          account_id: userInfo.account_id,
          display_name: userInfo.display_name,
        },
      };
    } catch (error) {
      console.error("Zoom connection test failed:", error);
      return {
        success: false,
        message: `Connection failed: ${
          error instanceof Error && "message" in error
            ? error.message
            : String(error)
        }`,
      };
    }
  }
}
