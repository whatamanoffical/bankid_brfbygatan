// src/lib/wordpress.ts

export async function checkWordPressUser(personalNumber: string) {
  const response = await fetch(
    `/api/wordpress/check?personal_number=${personalNumber}`
  );
  if (!response.ok) {
    throw new Error("Failed to check WordPress user");
  }
  return response.json();
}

export async function loginWordPressUser(personalNumber: string) {
  const response = await fetch("/api/wordpress/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ personal_number: personalNumber }),
  });

  if (!response.ok) {
    throw new Error("Failed to login WordPress user");
  }
  return response.json();
}
