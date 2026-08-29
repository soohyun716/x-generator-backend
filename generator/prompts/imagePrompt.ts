export function createImagePrompt(scene: string) {
  return `
Create ONE realistic smartphone photo for a Korean viral anecdote or meme.

[SCENE]
${scene}

[LOCATION / PEOPLE]
- The scene must clearly take place in South Korea.
- If people appear, they should be Korean unless the scene naturally requires otherwise.
- Use realistic Korean environments such as:
  - Korean apartment interiors or hallways
  - Korean cafés
  - Korean offices
  - Korean university campuses
  - Korean convenience stores
  - Korean subways or buses
  - Korean restaurants
  - Korean streets, alleys, parking lots, delivery areas
- Architecture, furniture, signs, packaging, outlets, doors, elevators, tables, and everyday objects should feel naturally Korean.
- Avoid generic American or European-looking environments.

[PHOTO STYLE]
- Photorealistic.
- Must look like an ordinary Korean person quickly took the photo with a smartphone.
- Casual snapshot, not a professional photo.
- Slightly imperfect framing is preferred.
- Natural smartphone perspective.
- Slight camera noise, mild motion blur, imperfect focus, or uneven exposure are acceptable when realistic.
- Use ordinary indoor lighting, fluorescent lighting, apartment hallway lighting, café lighting, daylight, or street lighting depending on the scene.
- Do not use cinematic lighting.
- Do not use dramatic color grading.
- Do not use studio lighting.
- Do not make the image look like an advertisement.
- Avoid overly perfect symmetry or composition.

[CONTENT DIRECTION]
- Prefer showing the RESULT or evidence of the incident rather than a staged reenactment.
- The image should feel like someone took a quick proof photo after something funny, strange, awkward, or unexpected happened.
- The viewer should immediately think: "What happened here?"
- If the story can be shown without people, prefer objects, food, rooms, desks, doors, receipts, delivery bags, clothing, notes, or other physical evidence.
- If people are necessary, keep expressions and poses natural and subtle.
- Avoid exaggerated acting.
- Avoid obvious meme poses unless the scene specifically requires it.
- The image itself should contain a visible funny or curious detail that supports the story.

[TEXT / UI RESTRICTIONS]
- Generate ONLY the raw photo.
- Do NOT create a social media post.
- Do NOT create a screenshot layout.
- Do NOT add a white card.
- Do NOT add captions.
- Do NOT add the story text.
- Do NOT add the title.
- Do NOT add usernames.
- Do NOT add profile photos.
- Do NOT add like, comment, repost, share, bookmark, or view icons.
- Do NOT add app interfaces or social media UI.
- Do NOT add decorative borders.
- Do NOT add watermarks.

[TEXT INSIDE THE PHOTO]
- Avoid text whenever possible.
- If text is naturally required by the scene, keep it minimal and incidental.
- Do not generate long Korean sentences inside the image.
- Avoid fake brand names or fake logos.
- Real-world branding should not be the focus of the image.

[REALISM CHECK]
The final image must NOT look:
- AI-generated
- cinematic
- staged
- promotional
- stock-photo-like
- overly clean
- overly dramatic
- surreal

It should look like a believable photo found in a Korean group chat or online community.

Final output:
ONE raw realistic smartphone photograph only.
`;
}