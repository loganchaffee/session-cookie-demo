const signUpUsernameInput = document.getElementById('signUpUsername');
const signUpPasswordInput = document.getElementById('signUpPassword');
const signUpButton = document.getElementById('signUpButton');
const signUpMessage = document.getElementById('signUpMessage');
const signInUsernameInput = document.getElementById('signInUsername');
const signInPasswordInput = document.getElementById('signInPassword');
const signInButton = document.getElementById('signInButton');
const signInMessage = document.getElementById('signInMessage');
const errorMessage = document.getElementById('errorMessage');

// API Functions
async function signUp(e) {
  e.preventDefault();
  try {
    const res = await fetch('/api/sign-up', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: signUpUsernameInput.value,
        password: signUpPasswordInput.value,
      }),
    });

    const json = await res.json();

    if (json.error) {
      throw new Error(json.error);
    }

    signUpMessage.style.display = 'block';
  } catch (error) {
    console.log(error);
  }
}

async function signIn(e) {
  e.preventDefault();
  try {
    const res = await fetch('/api/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: signInUsernameInput.value,
        password: signInPasswordInput.value,
      }),
    });

    const json = await res.json();

    if (json.error) {
      throw new Error(json.error);
    }

    signInMessage.style.display = 'block';

    errorMessage.style.display = 'none';
  } catch (error) {
    signInMessage.style.display = 'none';

    errorMessage.style.display = 'block';

    console.log(error);
  }
}

// Event Listeners
signUpButton.addEventListener('click', signUp);

signInButton.addEventListener('click', signIn);
