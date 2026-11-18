"use server";

import {
  type MagicLinkState,
  sendMagicLink,
} from "@flagscore/core/auth/server";

export async function login(
  _state: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  return sendMagicLink(formData);
}
