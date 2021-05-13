use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct DoSomethingPayload<'a> {
  state: &'a str,
}

#[derive(Serialize)]
struct Response<'a> {
  value: u64,
  message: &'a str,
}

#[derive(Debug, Clone, Serialize)]
struct CommandError<'a> {
  message: &'a str,
}

impl<'a> CommandError<'a> {
  fn new(message: &'a str) -> Self {
    Self { message }
  }
}

impl<'a> std::fmt::Display for CommandError<'a> {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "{}", self.message)
  }
}

impl<'a> std::error::Error for CommandError<'a> {}

#[tauri::command]
fn do_something<'a>(
  count: u64,
  payload: DoSomethingPayload<'a>,
) -> Result<Response<'a>, CommandError<'a>> {
  if count > 5 {
    let response = Response {
      value: 5,
      message: payload.state,
    };
    Ok(response)
  } else {
    Err(CommandError::new("count should be > 5").into())
  }
}

fn main() {
  let result = tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![do_something])
    .run(tauri::generate_context!());

  println!("{:?}", result)
}
