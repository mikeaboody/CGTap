class TimeSheets < ActiveRecord::Base
	def timeFrom(microseconds)
		return TimeSheets.where("submission_time > " << microseconds)
	end
end