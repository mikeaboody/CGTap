require 'rubygems'
require 'google/api_client'
require 'google/api_client/client_secrets'
require 'google/api_client/auth/file_storage'
require 'sinatra'
require 'logger'
require 'net/http'
require 'sinatra/activerecord'
require './config/environments' #database configuration
require './models/time_sheets'  #TimeSheets

enable :sessions


def api_client; settings.api_client; end

def calendar_api; settings.calendar; end

def user_credentials
  # Build a per-request oauth credential based on token stored in session
  # which allows us to use a shared API client.
  @authorization ||= (
    auth = api_client.authorization.dup
    auth.redirect_uri = to('/oauth2callback')
    auth.update_token!(session)
    auth
  )
end

configure do
  client = Google::APIClient.new(
    :application_name => 'Ruby Calendar sample',
    :application_version => '1.0.0')
  

  client_secrets = Google::APIClient::ClientSecrets.load
  client.authorization = client_secrets.to_authorization
  client.authorization.scope = 'https://www.googleapis.com/auth/calendar'
 

  # Since we're saving the API definition to the settings, we're only retrieving
  # it once (on server start) and saving it between requests.
  # If this is still an issue, you could serialize the object and load it on
  # subsequent runs.
  calendar = client.discovered_api('calendar', 'v3')

  set :api_client, client
  set :calendar, calendar
end



get '/oauth2authorize' do
  # Request authorization
  redirect user_credentials.authorization_uri.to_s, 303
end

get '/oauth2callback' do
  # Exchange token
  user_credentials.code = params[:code] if params[:code]
  user_credentials.fetch_access_token!
  session[:access_token] = user_credentials.access_token
  session[:refresh_token] = user_credentials.refresh_token
  session[:expires_in] = user_credentials.expires_in
  session[:issued_at] = user_credentials.issued_at
  redirect to('/')
end

get '/' do
  # Fetch list of events on the user's default calandar
  unless user_credentials.access_token 
    redirect to('/oauth2authorize')
  else
    result = api_client.execute(:api_method => calendar_api.events.list,
                              :parameters => {'calendarId' => 'primary'},
                              :authorization => user_credentials)
    @email = JSON.parse(result.data.to_json)["summary"]
    erb :index
  end
end
get '/disconnect' do
  token = session.delete("access_token")
  session.delete("refresh_token")
  session.delete("expires_in")
  session.delete("issued_at")
  response = Net::HTTP.get(URI.parse("https://accounts.google.com/o/oauth2/revoke?token=" + token))
  redirect to("/")
end

post "/submit" do
  first_name = params.delete("first_name")
  last_name = params.delete("last_name")
  email = params["email"]
  submission_time = params["date"]
  hours = params["hours"]
  @time_sheets = TimeSheets.new({first_name: first_name, last_name: last_name, email: email, submission_time: submission_time, hours: hours})
  if @time_sheets.save
    puts "SUCCESS"
  else
    "Sorry, there was an error!"
  end
end

get "/display" do
  @time_sheets = TimeSheets.fromFiveDaysAgo params["email"]
  erb :display
end
