class BuildPartJob < JobBase
  attr_reader :build_part, :build

  def initialize(build_part_id)
    @build_part = BuildPart.find(build_part_id)
    @build = build_part.build
  end

  def perform
    GitRepo.inside_copy('web-cache', build.sha, true) do
      # TODO:
      # collect stdout, stderr, and any logs
      result = tests_green? ? :passed : :failed
      build_part_result = build_part.build_part_results.create!(:state => result)
      collect_artifacts(build_part_result, BUILD_ARTIFACTS)
    end
  end

  def tests_green?
    ENV["TEST_RUNNER"] = build_part.kind
    ENV["RUN_LIST"] = build_part.paths.join(",")
    system(BUILD_COMMAND.call build_part)
  end

  def collect_artifacts(result, artifacts_glob)
    Dir[*artifacts_glob].each do |path|
      if File.file? path
        result.build_artifacts.create!(:content => File.read(path), :name => path)
      end
    end
  end
end
